import React from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

interface StarRatingProps {
  rating: number | null;
  onRate?: (rating: number) => void;
  interactive?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRate, interactive = false }) => {
  const [hover, setHover] = React.useState<number | null>(null);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={clsx(
            "transition-all duration-200",
            interactive ? "hover:scale-125 cursor-pointer" : "cursor-default",
            (hover !== null ? star <= hover : star <= (rating || 0))
              ? "text-yellow-400 fill-yellow-400"
              : "text-base-300 fill-transparent"
          )}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(null)}
        >
          <Star size={interactive ? 24 : 18} />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
