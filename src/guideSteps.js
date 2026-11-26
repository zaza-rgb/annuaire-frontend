// Guide visiteur : une entrée par étape.
// Toutes les positions sont en % de la capture (x vers la droite, y vers le bas).
//  - ratio : largeur / hauteur de la capture (sert à dessiner la flèche sans la déformer)
//  - target : centre de l'élément à montrer, et taille du cercle de mise en valeur (w, h)
//  - bubble : centre de la bulle
// Pour un futur guide commerçant ou organisateur, ajouter un autre tableau ici.
import { Compass, Store, MapPin, UserPlus } from "lucide-react";

const IMG = "/images/guide/";

export const visitorSteps = [
  {
    key: "access",
    icon: Compass,
    image: IMG + "guide-step1-accueil.webp",
    ratio: 1779 / 946,
    target: { x: 42.7, y: 3.8, w: 7.4, h: 5.6 },
    bubble: { x: 64, y: 17 },
  },
  {
    key: "choose",
    icon: Store,
    image: IMG + "guide-step2-explorer.webp",
    ratio: 1778 / 939,
    target: { x: 44.7, y: 37.6, w: 49.5, h: 7.4 },
    bubble: { x: 76, y: 50 },
  },
  {
    key: "details",
    icon: MapPin,
    image: IMG + "guide-step3-explorer-restaurant.webp",
    ratio: 1776 / 953,
    target: { x: 34.7, y: 79.3, w: 7.2, h: 6.2 },
    bubble: { x: 60, y: 60 },
  },
  {
    key: "account",
    icon: UserPlus,
    image: IMG + "guide-step4-inscription.webp",
    ratio: 1788 / 893,
    target: { x: 86, y: 4.6, w: 11.4, h: 7.4 },
    bubble: { x: 80, y: 24 },
  },
];
