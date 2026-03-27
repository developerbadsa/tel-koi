import { areas } from "@/i18n/dict";

export type StationArea = (typeof areas)[number];

export type KnownStation = {
  id: string;
  name: string;
  location: string;
  area: StationArea;
  services?: string[];
  contact?: string;
  specialty?: string;
  aliases?: string[];
  source: "official" | "community";
};

export const knownStations: KnownStation[] = [
  {
    id: "binimoy-filling-station",
    name: "Binimoy Filling Station",
    location: "Mostofee, Lalmonirhat-Phulbari Road",
    area: "Lalmonirhat Sadar",
    services: ["Octane", "Petrol", "Diesel", "Car Wash", "Propane Exchange"],
    contact: "+880 591-61376",
    specialty: "Open 24 hours, near Mostofee Bazar",
    aliases: ["Mostofee Bazar", "Mostafee", "বিনিময়"],
    source: "community",
  },
  {
    id: "hossain-brothers-filling-station",
    name: "Hossain Brothers Filling Station",
    location: "Airport Road, Mahendranagar / Haribhange, Lalmonirhat Sadar",
    area: "Lalmonirhat Sadar",
    services: ["Octane", "Petrol", "Diesel", "Car Wash", "Air Pump"],
    contact: "+880 1824-619578",
    specialty: "Long-standing trusted station in Mahendranagar",
    aliases: ["M/S Hossain Brothers F/S", "Haribhange", "Airport Road"],
    source: "official",
  },
  {
    id: "cosmos-cng-filling-station",
    name: "Cosmos CNG Filling Station & Petrol Pump",
    location: "Saptana, Lalmonirhat Sadar",
    area: "Lalmonirhat Sadar",
    services: ["CNG", "Octane", "Petrol", "Diesel"],
    specialty: "Major CNG provider in Sadar area",
    aliases: ["Cosmos", "Saptana"],
    source: "community",
  },
  {
    id: "tashfin-cng-refueling-station",
    name: "Tashfin CNG Refueling Station",
    location: "Lalmonirhat Sadar",
    area: "Lalmonirhat Sadar",
    services: ["CNG", "Petrol", "Diesel"],
    specialty: "Key refueling point for CNG vehicles",
    aliases: ["Tashfin", "CNG Refueling"],
    source: "community",
  },
  {
    id: "limon-brothers-filling-station",
    name: "Messrs Limon & Brothers Filling Station",
    location: "Sadar Road / Lalmonirhat Sadar",
    area: "Lalmonirhat Sadar",
    services: ["Octane", "Petrol", "Diesel"],
    specialty: "Registered dealer under Meghna Petroleum",
    aliases: ["M/S Limon & Brothers Filling Station", "Limon Brothers"],
    source: "official",
  },
  {
    id: "gm-trading-filling-station",
    name: "M/S G.M. Trading Filling Station",
    location: "Saptana, Lalmonirhat Sadar",
    area: "Lalmonirhat Sadar",
    specialty: "Officially listed filling station in Sadar area",
    aliases: ["GM Trading", "G.M.Trading", "Saptana"],
    source: "official",
  },
  {
    id: "fatema-filling-station",
    name: "Fatema Filling Station",
    location: "Aditmari (near Sadar border)",
    area: "Aditmari",
    services: ["Petrol", "Diesel"],
    specialty: "Frequently used by travelers from Sadar to Aditmari",
    aliases: ["Aditmari", "ফাতেমা"],
    source: "official",
  },
  {
    id: "daulah-filling-station",
    name: "Messrs Daulah Filling Station",
    location: "Lalmonirhat-Phulbari Road, Saptibari / Khatapara, Aditmari",
    area: "Aditmari",
    services: ["Petrol", "Diesel", "Lubricants"],
    contact: "+880 1780-801121",
    specialty: "Main station for Saptibari residents",
    aliases: ["Doula Filling Station", "Daulah", "Saptibari", "Khatapara"],
    source: "community",
  },
  {
    id: "ks-filling-station",
    name: "Messrs K.S. Filling Station",
    location: "Madanpur, Namuri Bazar Highway, Aditmari",
    area: "Aditmari",
    services: ["Octane", "Petrol", "Diesel", "Restroom", "WiFi"],
    contact: "+880 1787-790693",
    specialty: "Highway facility with modern amenities",
    aliases: ["K.S. Filling Station", "Namuri Bazar", "Madanpur"],
    source: "official",
  },
  {
    id: "rawshan-filling-station",
    name: "Rawshan Filling Station",
    location: "Tushbhandar, Kaliganj",
    area: "Kaliganj",
    specialty: "Officially listed filling station in Tushbhandar",
    aliases: ["Rawshan", "Tushbhandar"],
    source: "official",
  },
  {
    id: "jamena-filling-station",
    name: "Jamena Filling Station",
    location: "Chaparhat, Kaliganj",
    area: "Kaliganj",
    specialty: "Officially listed filling station in Chaparhat",
    aliases: ["Jameena", "Chaparhat"],
    source: "official",
  },
  {
    id: "fazle-rabbe-filling-station",
    name: "Fazle Rabbe Filling Station",
    location: "Rudreshwar, Kakina, Kaliganj",
    area: "Kaliganj",
    specialty: "Officially listed filling station near Kakina",
    aliases: ["Rudreshwar", "Kakina"],
    source: "official",
  },
  {
    id: "kabbo-digonto-filling-station",
    name: "M/S Kabbo Digonto Filling Station",
    location: "Kashiram, Kaliganj",
    area: "Kaliganj",
    specialty: "Officially listed filling station in Kashiram",
    aliases: ["Kabbo Digonto", "Kashiram"],
    source: "official",
  },
  {
    id: "shaheen-brothers-filling-station",
    name: "Shaheen & Brothers Filling Station",
    location: "Barobarihat, Lalmonirhat",
    area: "Lalmonirhat Sadar",
    specialty: "Officially listed station on the Barobarihat side",
    aliases: ["Shaheen Brothers", "Barobarihat"],
    source: "official",
  },
  {
    id: "alhaj-jm-filling-station",
    name: "Alhaj J.M. Filling Station",
    location: "Ufarmara, Burimari, Patgram",
    area: "Patgram",
    specialty: "Officially listed station serving the Burimari corridor",
    aliases: ["Alhaj JM", "Burimari", "Ufarmara"],
    source: "official",
  },
  {
    id: "sharmila-filling-station",
    name: "M/S Sharmila Filling Station",
    location: "Rasulgonj, Patgram Pourashava",
    area: "Patgram",
    specialty: "Officially listed filling station in Patgram town side",
    aliases: ["Sharmila", "Rasulgonj", "Rasulganj"],
    source: "official",
  },
];
