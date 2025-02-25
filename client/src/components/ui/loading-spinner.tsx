import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className={cn("relative", className)}>
      <svg
        className={cn("animate-spin", sizeClasses[size])}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle */}
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" className="opacity-20" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M50 10
            A40 40 0 0 1 90 50
            A40 40 0 0 1 50 90
            A40 40 0 0 1 10 50
            A40 40 0 0 1 50 10
            Z
            M50 20
            A30 30 0 0 0 20 50
            A30 30 0 0 0 50 80
            A30 30 0 0 0 80 50
            A30 30 0 0 0 50 20
            Z"
        />
        {/* Kawaii face - initially sad */}
        <g className="animate-kawaii">
          {/* Eyes */}
          <circle cx="35" cy="45" r="3" fill="currentColor" className="animate-blink" />
          <circle cx="65" cy="45" r="3" fill="currentColor" className="animate-blink" />

          {/* Mouth - transitions from sad to happy */}
          <path
            d="M40 65 Q50 60 60 65"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-mouth"
          >
            <animate
              attributeName="d"
              dur="2s"
              repeatCount="indefinite"
              values="
                M40 65 Q50 60 60 65;
                M40 60 Q50 70 60 60
              "
            />
          </path>

          {/* Blush marks */}
          <circle cx="30" cy="55" r="4" fill="currentColor" className="opacity-20" />
          <circle cx="70" cy="55" r="4" fill="currentColor" className="opacity-20" />
        </g>
      </svg>
    </div>
  );
}