import * as migration_20260520_065625 from './20260520_065625';
import * as migration_20260520_090936_add_user_verification_fields from './20260520_090936_add_user_verification_fields';
import * as migration_20260520_112000_add_pages_hero_mobile_media from './20260520_112000_add_pages_hero_mobile_media';
import * as migration_20260520_152556_add_media_block_media_items from './20260520_152556_add_media_block_media_items';
import * as migration_20260521_094940_add_sale_pricing from './20260521_094940_add_sale_pricing';
import * as migration_20260521_095211 from './20260521_095211';
import * as migration_20260521_095600 from './20260521_095600';

export const migrations = [
  {
    up: migration_20260520_065625.up,
    down: migration_20260520_065625.down,
    name: '20260520_065625',
  },
  {
    up: migration_20260520_090936_add_user_verification_fields.up,
    down: migration_20260520_090936_add_user_verification_fields.down,
    name: '20260520_090936_add_user_verification_fields',
  },
  {
    up: migration_20260520_112000_add_pages_hero_mobile_media.up,
    down: migration_20260520_112000_add_pages_hero_mobile_media.down,
    name: '20260520_112000_add_pages_hero_mobile_media',
  },
  {
    up: migration_20260520_152556_add_media_block_media_items.up,
    down: migration_20260520_152556_add_media_block_media_items.down,
    name: '20260520_152556_add_media_block_media_items',
  },
  {
    up: migration_20260521_094940_add_sale_pricing.up,
    down: migration_20260521_094940_add_sale_pricing.down,
    name: '20260521_094940_add_sale_pricing',
  },
  {
    up: migration_20260521_095211.up,
    down: migration_20260521_095211.down,
    name: '20260521_095211',
  },
  {
    up: migration_20260521_095600.up,
    down: migration_20260521_095600.down,
    name: '20260521_095600'
  },
];
