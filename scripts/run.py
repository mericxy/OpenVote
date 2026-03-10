import platform
import shutil
import subprocess
import os
import sys
import time
import signal
import hashlib
import argparse
from pathlib import Path

IS_WINDOWS = platform.system().lower() == "windows"

def get_file_hash(file_path: Path) -> str:
    if not file_path.exists():
        return ""
    with open(file_path, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()
    
def should_install(target_file: Path, hash_file: Path) -> bool:
    if not target_file.exists():
        return False
    
    current_hash = get_file_hash(target_file)
    
    if not hash_file.exists():
        return True
    
    with open(hash_file, "r") as f:
        stored_hash = f.read().strip()
    
    return current_hash != stored_hash

def save_hash(target_file: Path, hash_file: Path):
    with open(hash_file, "w") as f:
        f.write(get_file_hash(target_file))

def start_process(cmd: list[str], cwd: Path, name: str, env: dict = None) -> subprocess.Popen:
    kwargs = {}
    if IS_WINDOWS:
        kwargs['creationflags'] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        kwargs['start_new_session'] = True

    current_env = os.environ.copy()
    if env:
        current_env.update(env)

    return subprocess.Popen(
        cmd,
        cwd=cwd,
        stdin=subprocess.DEVNULL,
        env=current_env,
        **kwargs
    )

def ensure_npm_packages(project_dir: Path, npm_exec: str, name: str):
    package_json = project_dir / "package.json"
    node_modules = project_dir / "node_modules"
    hash_file = project_dir / ".installed_hash"

    if not package_json.exists():
        raise FileNotFoundError(f"package.json não encontrado em {project_dir}")

    if not node_modules.exists() or should_install(package_json, hash_file):
        print(f"Instalando/atualizando dependências de {name} (npm install)...")
        if subprocess.call([npm_exec, "install"], cwd=project_dir) != 0:
            raise RuntimeError(f"Falha ao instalar dependências de {name}.")
        save_hash(package_json, hash_file)
    else:
        print(f"✔ Dependências de {name} já estão instaladas e atualizadas.")

def ensure_env_file(project_dir: Path):
    env_file = project_dir / ".env"
    env_example = project_dir / ".env.example"
    
    if not env_file.exists():
        if env_example.exists():
            print(f"Copiando .env.example para .env em {project_dir}")
            shutil.copy(env_example, env_file)
        else:
            print(f"⚠ Aviso: .env não encontrado em {project_dir} e .env.example também não existe.")

def ensure_db_setup(api_dir: Path, npm_exec: str):
    print("Aplicando migrações do banco (drizzle-kit migrate)...")
    
    # Gerar migrations caso não existam (opcional, mas seguro)
    # subprocess.call([npm_exec, "run", "db:generate"], cwd=api_dir)
    
    # Usar migrate para MariaDB
    if subprocess.call(["npx", "drizzle-kit", "migrate"], cwd=api_dir) != 0:
        print("⚠ Falha ao aplicar migrações do banco. Certifique-se que o MariaDB está rodando.")
        return
    
    print("Populando banco de dados inicial (seed)...")
    subprocess.call([npm_exec, "run", "seed"], cwd=api_dir)

def kill_recursive(proc: subprocess.Popen):
    if proc.poll() is not None:
        return

    try:
        if IS_WINDOWS:
            subprocess.run(f"taskkill /F /T /PID {proc.pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    except Exception as e:
        print(f"Erro ao tentar matar arvore de processos: {e}")

def kill_port(port: int):
    try:
        if IS_WINDOWS:
            cmd = f"netstat -ano | findstr :{port}"
            output = subprocess.check_output(cmd, shell=True).decode()
            pids = {line.split()[-1] for line in output.strip().split('\n') if line}
            for pid in pids:
                if pid != "0":
                    subprocess.run(f"taskkill /F /PID {pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            cmd = f"lsof -t -i:{port}"
            pid_out = subprocess.check_output(cmd, shell=True).decode().strip()
            if pid_out:
                for p in pid_out.split('\n'):
                    subprocess.run(f"kill -9 {p}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

def wait_processes(processes: list[tuple[str, subprocess.Popen]]):
    try:
        while True:
            for name, proc in processes:
                return_code = proc.poll()
                if return_code is not None:
                    print(f"\n{name} finalizado (código {return_code}). Encerrando processos...")
                    return
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nInterrupção do usuário. Encerrando processos...")

def resolve_npm_executable() -> str:
    npm_path = shutil.which("npm") or shutil.which("npm.cmd")
    if not npm_path:
        raise FileNotFoundError("npm não encontrado no PATH. Instale o Node.js 18+ e reinicie o terminal.")
    return npm_path

def main():
    parser = argparse.ArgumentParser(description="Script de execução OpenVote")
    parser.add_argument("--prod", action="store_true", help="Executa em modo de produção (build frontend + static serve)")
    args = parser.parse_args()

    root = Path(__file__).parent.parent
    api_dir = root / "api"
    frontend_dir = root / "frontend"

    if not api_dir.exists() or not frontend_dir.exists():
        raise FileNotFoundError("Pastas 'api' ou 'frontend' não foram encontradas no diretório raiz.")

    print(f"-------------------🛠 Preparando ambiente OpenVote ({'PRODUÇÃO' if args.prod else 'DESENVOLVIMENTO'})-------------------")
    npm_exec = resolve_npm_executable()
    if not shutil.which("make"):
        raise RuntimeError("make não encontrado. Instale build-essential.")
    
    ensure_env_file(api_dir)
    ensure_npm_packages(api_dir, npm_exec, "API")
    ensure_db_setup(api_dir, npm_exec)
    
    ensure_npm_packages(frontend_dir, npm_exec, "Frontend")

    api_port = 3333
    frontend_port = 5173
    
    kill_port(api_port)
    if not args.prod:
        kill_port(frontend_port)

    processes = []

    if args.prod:
        print("\nGerando build do frontend...")
        if subprocess.call([npm_exec, "run", "build"], cwd=frontend_dir) != 0:
            raise RuntimeError("Falha ao buildar o frontend.")
        
        print("Gerando build da API...")
        if subprocess.call([npm_exec, "run", "build"], cwd=api_dir) != 0:
            raise RuntimeError("Falha ao buildar a API.")
        
        print("Iniciando API em modo produção (servindo frontend)...")
        api_proc = start_process([npm_exec, "run", "start"], api_dir, name="API", env={"NODE_ENV": "production"})
        processes.append(("API", api_proc))
    else:
        print("\nIniciando API em modo desenvolvimento...")
        api_proc = start_process([npm_exec, "run", "dev"], api_dir, name="API")
        processes.append(("API", api_proc))

        print("Iniciando Frontend em modo desenvolvimento...")
        frontend_proc = start_process([npm_exec, "run", "dev"], frontend_dir, name="Frontend")
        processes.append(("Frontend", frontend_proc))

    print(f"\n---------------------OpenVote Rodando ({'PROD' if args.prod else 'DEV'})!-----------------------")
    print(f"Acesse: http://localhost:{api_port}")
    if not args.prod:
        print(f"Frontend Dev: http://localhost:{frontend_port}")
    print("-------------------------------------------------------------\n")
    
    try:
        wait_processes(processes)
    finally:
        for name, proc in processes:
            kill_recursive(proc)
        kill_port(api_port)
        if not args.prod:
            kill_port(frontend_port)

if __name__ == "__main__":
    main()
