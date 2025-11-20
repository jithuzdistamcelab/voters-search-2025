export interface Voter {
  id: number;
  serial: number;

  name_en: string;
  name_ml: string;

  guardian_en: string;
  guardian_ml: string;

  house_no: string;
  house_name_en: string;
  house_name_ml: string;

  gender: string;
  age: number;

  voter_id: string;

  ward: string;
  ward_name: string;

  polling_station: string;
  district: string;
  local_body: string;
}

export const WARDS = [
  { code: "049", name: "KAIKULANGARA" },
  { code: "048", name: "PORT" },
  // add more...
];