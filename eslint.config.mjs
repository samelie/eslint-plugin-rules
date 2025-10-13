import antfu from '@antfu/eslint-config'

export default antfu({ node: true, typescript: true }).override('antfu/typescript/rules', {
  rules: {
    'ts/no-explicit-any': 'error',
  },
})
