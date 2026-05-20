import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Use this for a single image.',
      },
    },
    {
      name: 'mediaItems',
      type: 'array',
      admin: {
        description: 'Add multiple images to render this block as an auto-advancing carousel.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}
