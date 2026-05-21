import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { Plugin } from 'payload'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'

import { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { ProductsCollection } from '@/collections/Products'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'
import { cashfreeAdapter } from '@/payments/cashfree'
import { ecommerceCurrenciesConfig } from '@/utilities/ecommerceCurrencies'
import { VariantsCollection } from '@/collections/Variants'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Ecommerce Template` : 'Payload Ecommerce Template'
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

const r2PublicURL = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL
const r2Enabled = Boolean(
  process.env.R2_BUCKET &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_ENDPOINT &&
  r2PublicURL,
)

export const plugins: Plugin[] = [
  s3Storage({
    bucket: process.env.R2_BUCKET || '',
    collections: {
      media: {
        generateFileURL: ({ filename, prefix }) => {
          const baseURL = (r2PublicURL || '').replace(/\/$/, '')
          const filePrefix = prefix ? `${prefix.replace(/^\/|\/$/g, '')}/` : ''

          return `${baseURL}/${filePrefix}${filename}`
        },
      },
    },
    config: {
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
      endpoint: process.env.R2_ENDPOINT,
      region: 'auto',
    },
    enabled: r2Enabled,
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
      },
      admin: {
        group: 'Content',
      },
    },
    formOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
        create: isAdmin,
      },
      admin: {
        group: 'Content',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    currencies: ecommerceCurrenciesConfig,
    customers: {
      slug: 'users',
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        fields: [
          ...defaultCollection.fields,
          {
            name: 'shippingStatus',
            type: 'select',
            defaultValue: 'pending',
            admin: {
              position: 'sidebar',
            },
            label: 'Shipping status',
            options: [
              {
                label: 'Pending',
                value: 'pending',
              },
              {
                label: 'Packed',
                value: 'packed',
              },
              {
                label: 'Shipped',
                value: 'shipped',
              },
              {
                label: 'Delivered',
                value: 'delivered',
              },
            ],
          },
          {
            name: 'trackingNumber',
            type: 'text',
            admin: {
              condition: (_, siblingData) =>
                siblingData?.shippingStatus === 'shipped' ||
                siblingData?.shippingStatus === 'delivered',
              position: 'sidebar',
            },
            label: 'Tracking number',
          },
          {
            name: 'accessToken',
            type: 'text',
            unique: true,
            index: true,
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
            hooks: {
              beforeValidate: [
                ({ value, operation }) => {
                  if (operation === 'create' || !value) {
                    return crypto.randomUUID()
                  }
                  return value
                },
              ],
            },
          },
        ],
      }),
    },
    payments: {
      paymentMethods: [cashfreeAdapter()],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
      variants: {
        variantsCollectionOverride: VariantsCollection,
      },
    },
  }),
]
