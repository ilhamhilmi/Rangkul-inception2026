import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 10c0 5-8 11-8 11s-8-6-8-11a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </IconBase>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}

export function HeartHandshakeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
      <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
      <path d="m18 15-2-2" />
      <path d="m15 18-2-2" />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m20 6-11 11-5-5" />
    </IconBase>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </IconBase>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3Z" />
      <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
      <path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" />
    </IconBase>
  );
}

export function AccessibilityIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="4.5" r="2.2" />
      <path d="M5 8.5c4.6 1.7 9.4 1.7 14 0" />
      <path d="m12 10.5.5 4.5 3.5 6" />
      <path d="m12.5 15-3.5 6" />
      <path d="M12 10.5v4.5" />
    </IconBase>
  );
}

export function DoorIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 21h16" />
      <path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17" />
      <path d="M14 12h.01" />
    </IconBase>
  );
}

export function RouteIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </IconBase>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </IconBase>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </IconBase>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </IconBase>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 6h9" />
      <path d="M17 6h3" />
      <circle cx="15" cy="6" r="2" />
      <path d="M4 12h3" />
      <path d="M11 12h9" />
      <circle cx="9" cy="12" r="2" />
      <path d="M4 18h9" />
      <path d="M17 18h3" />
      <circle cx="15" cy="18" r="2" />
    </IconBase>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function XIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </IconBase>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <IconBase fill="currentColor" stroke="none" {...props}>
      <path d="m12 3.3 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.5l5.9-.9L12 3.3Z" />
    </IconBase>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </IconBase>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </IconBase>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 4 6 2 6-2v14l-6 2-6-2-6 2V6l6-2Z" />
      <path d="M9 4v14" />
      <path d="M15 6v14" />
    </IconBase>
  );
}

export function NavigationIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M21 3 3 10.5l7 2.5 2.5 7L21 3Z" />
      <path d="m10 13 4.5-4.5" />
    </IconBase>
  );
}

export function WalkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="13" cy="4.5" r="2" />
      <path d="m10 22 2-6 2-2-1.5-5-3.5 1-2 3" />
      <path d="m14 14 2 3 .5 5" />
      <path d="M9 11 6 22" />
    </IconBase>
  );
}

export function RampIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 19h18" />
      <path d="M3 19 15 7h6" />
      <path d="M15 7v12" />
    </IconBase>
  );
}

export function ParkingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M10 17V7h4a3 3 0 0 1 0 6h-4" />
    </IconBase>
  );
}

export function ToiletIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="7" cy="4.5" r="2" />
      <path d="M5 21v-5H4v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4H9v5" />
      <circle cx="17" cy="4.5" r="2" />
      <path d="M17 8v13" />
      <path d="M14 13h6l-1 4h-4l-1-4Z" />
    </IconBase>
  );
}

export function LiftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M12 3v18" />
      <path d="m8 9 0-3 0 3" />
      <path d="m6.5 7.5 1.5-1.5 1.5 1.5" />
      <path d="m16 15 0 3 0-3" />
      <path d="m14.5 16.5 1.5 1.5 1.5-1.5" />
    </IconBase>
  );
}

export function GuidingBlockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 21V8a6 6 0 0 1 12 0v13" />
      <path d="M9 21v-9" />
      <path d="M15 21v-9" />
      <path d="M9 12h6" />
      <path d="M3 21h18" />
    </IconBase>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
      <path d="M15 9a4 4 0 0 1 0 6" />
      <path d="M18 6a8 8 0 0 1 0 12" />
    </IconBase>
  );
}

export function VolumeOffIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
      <path d="m16 9 5 6" />
      <path d="m21 9-5 6" />
    </IconBase>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 9 6 6 6-6" />
    </IconBase>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 6 6 6-6 6" />
    </IconBase>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </IconBase>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
    </IconBase>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </IconBase>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </IconBase>
  );
}

export function TreeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3 6.5 11h11L12 3Z" />
      <path d="M12 8 5.5 16h13L12 8Z" />
      <path d="M12 16v5" />
      <path d="M9 21h6" />
    </IconBase>
  );
}

export function UtensilsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 3v7a2.5 2.5 0 0 0 5 0V3" />
      <path d="M8.5 12v9" />
      <path d="M17 3c-1.7 0-3 1.8-3 4s1.3 4 3 4V3Z" />
      <path d="M17 11v10" />
    </IconBase>
  );
}

export function TrainIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="5" y="3" width="14" height="13" rx="3" />
      <path d="M5 10h14" />
      <path d="M9 16l-2 5" />
      <path d="M15 16l2 5" />
      <path d="M9 6h.01" />
      <path d="M15 6h.01" />
    </IconBase>
  );
}

export function LandmarkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 21h18" />
      <path d="M4 21V10" />
      <path d="M20 21V10" />
      <path d="M4 10h16" />
      <path d="m12 3 8 7H4l8-7Z" />
      <path d="M8 21v-7" />
      <path d="M12 21v-7" />
      <path d="M16 21v-7" />
    </IconBase>
  );
}

export function HealthIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21s-8-4.6-8-10.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8 3.8C20 16.4 12 21 12 21Z" />
      <path d="M8 12h2l1-2 2 4 1-2h2" />
    </IconBase>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
    </IconBase>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </IconBase>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
      <path d="M14 9h4a2 2 0 0 1 2 2v10" />
      <path d="M2 21h20" />
      <path d="M8 7h2" />
      <path d="M8 11h2" />
      <path d="M8 15h2" />
      <path d="M17 13h.01" />
      <path d="M17 17h.01" />
    </IconBase>
  )
}

export function GlobeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.4 3.8 5.4 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.4-3.8-9S9.5 5.4 12 3Z" />
    </IconBase>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </IconBase>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </IconBase>
  );
}

export function MessageCircleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.8-.9L3 21l1.9-5a8.4 8.4 0 0 1-.9-3.8 8.4 8.4 0 0 1 8.4-8.4h.5a8.4 8.4 0 0 1 8.1 7.7Z" />
    </IconBase>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 5.2 2 2 0 0 1 6.5 3Z" />
    </IconBase>
  );
}

export function ThumbsUpIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3Z" />
      <path d="M7 10.5 11 3a2.4 2.4 0 0 1 2.3 2.9L12.5 9h6.1a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 17.2 20H7" />
    </IconBase>
  );
}