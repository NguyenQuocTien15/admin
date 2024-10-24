export interface ShipperModel {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  avatar: string;
  CIN: string; //citizen identification number
  DateOfIssuance: Date;
  files_card_front: string[];
  image_CCCD_card_front: string;
  files_card_back: string[];
  image_CCCD_card_back: string;
}
