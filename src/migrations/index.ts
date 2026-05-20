import * as migration_20260520_065625 from './20260520_065625';
import * as migration_20260520_090936_add_user_verification_fields from './20260520_090936_add_user_verification_fields';
import * as migration_20260520_112000_add_pages_hero_mobile_media from './20260520_112000_add_pages_hero_mobile_media';

export const migrations = [
  {
    up: migration_20260520_065625.up,
    down: migration_20260520_065625.down,
    name: '20260520_065625',
  },
  {
    up: migration_20260520_090936_add_user_verification_fields.up,
    down: migration_20260520_090936_add_user_verification_fields.down,
    name: '20260520_090936_add_user_verification_fields'
  },
  {
    up: migration_20260520_112000_add_pages_hero_mobile_media.up,
    down: migration_20260520_112000_add_pages_hero_mobile_media.down,
    name: '20260520_112000_add_pages_hero_mobile_media'
  },
];
