import { ButtonAnchor } from "@/components/ui/button";
import { ExternalLinkIcon, UsersIcon } from "@/components/ui/icons";

type JoinCommunityButtonProps = {
  communityName: string;
  joinUrl: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function JoinCommunityButton({
  communityName,
  joinUrl,
  size = "sm",
  className,
}: JoinCommunityButtonProps) {
  return (
    <ButtonAnchor
      href={joinUrl}
      target="_blank"
      rel="noopener noreferrer"
      size={size}
      className={className}
    >
      <UsersIcon className="h-4 w-4" />
      Bergabung
      <span className="sr-only"> dengan {communityName} (buka di tab baru)</span>
      <ExternalLinkIcon className="h-3.5 w-3.5" />
    </ButtonAnchor>
  );
}
