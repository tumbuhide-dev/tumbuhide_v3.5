import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaGithub,
  FaTwitch,
  FaSpotify,
  FaGlobe,
} from "react-icons/fa";
import { SiX } from "react-icons/si";

export const PlatformIcons = {
  instagram: FaInstagram,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  twitter: FaTwitter,
  x: SiX,
  facebook: FaFacebook,
  linkedin: FaLinkedin,
  github: FaGithub,
  twitch: FaTwitch,
  spotify: FaSpotify,
  website: FaGlobe,
} as const;

export const PlatformColors = {
  instagram: "#E4405F",
  tiktok: "#000000",
  youtube: "#FF0000",
  twitter: "#1DA1F2",
  x: "#000000",
  facebook: "#1877F2",
  linkedin: "#0077B5",
  github: "#333333",
  twitch: "#9146FF",
  spotify: "#1DB954",
  website: "#6B7280",
} as const;

export function getPlatformIcon(platform: string) {
  const IconComponent = PlatformIcons[platform as keyof typeof PlatformIcons];
  return IconComponent || PlatformIcons.website;
}

export function getPlatformColor(platform: string) {
  return (
    PlatformColors[platform as keyof typeof PlatformColors] ||
    PlatformColors.website
  );
}
