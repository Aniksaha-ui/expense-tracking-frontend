export const categoryFieldRules = {
  name: {
    maxLength: {
      message: 'Category name must be 255 characters or less.',
      value: 255,
    },
    required: 'Category name is required.',
  },
  type: {
    required: 'Category type is required.',
  },
}
