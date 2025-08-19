import { en } from './en';
import { ru } from './ru';
import { uz } from './uz';

export type Translation = typeof en;

export const translations = {
  ENG: en,
  RUS: ru,
  UZB: uz,
};
