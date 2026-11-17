export type MasalaId = "garam" | "biryani" | "elite" | "pili";

export type Masala = {
  id: MasalaId;
  name: string;
  color: string;
  spiceColor: string;
  hook: string;
  era: string;
  story: string[];
  ingredients: string[];
  sources: { claim: string; url: string }[];
};

export const masalas: Masala[] = [
  { id: "garam", name: "Garam Masala", color: "#8e2a22", spiceColor: "#7a4a22", hook: "", era: "", story: [], ingredients: [], sources: [] },
  { id: "biryani", name: "Biryani Masala", color: "#4d5a2c", spiceColor: "#8a6a2a", hook: "", era: "", story: [], ingredients: [], sources: [] },
  { id: "elite", name: "Elite All Purpose Masala", color: "#1f3358", spiceColor: "#9a3d1c", hook: "", era: "", story: [], ingredients: [], sources: [] },
  { id: "pili", name: "Pili Mirch", color: "#c8601c", spiceColor: "#b5361a", hook: "", era: "", story: [], ingredients: [], sources: [] },
];
