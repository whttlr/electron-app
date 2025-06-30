module.exports = {
  root: true, // Prevent inheritance from parent directories
  env: {
    browser: true,
    node: true,
    es2022: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: [
    'boundaries',
    '@typescript-eslint',
    'react',
    'react-hooks',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  rules: {
    // Airbnb overrides for project needs
    'import/extensions': ['error', 'ignorePackages', {
      js: 'always',
      ts: 'never',
      tsx: 'never',
    }],
    'import/prefer-default-export': 'off',
    'no-console': 'off', // Allowed in CLI applications
    'max-len': ['error', { code: 120, ignoreUrls: true, ignoreStrings: true }],
    
    // React rules
    'react/react-in-jsx-scope': 'off', // Not needed with React 18
    'react/prop-types': 'off', // Using TypeScript for prop validation
    
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    
    // Boundaries rules to enforce module architecture
    'boundaries/element-types': [2, {
      default: 'disallow',
      rules: [
        // Core modules can import from services and utils
        {
          from: 'core',
          allow: ['services', 'utils', 'core'],
        },
        // Services modules can import from utils only
        {
          from: 'services',
          allow: ['utils'],
        },
        // UI modules can import from core, services, and utils
        {
          from: 'ui',
          allow: ['core', 'services', 'utils'],
        },
        // Views can import from all layers
        {
          from: 'views',
          allow: ['core', 'services', 'ui', 'utils'],
        },
        // Utils modules should be pure (no imports from other layers)
        {
          from: 'utils',
          allow: [],
        },
      ],
    }],
    'boundaries/entry-point': [2, {
      default: 'disallow',
      rules: [
        // Only allow imports through index files
        {
          target: ['core', 'services'],
          allow: ['index.ts', 'index.js'],
        },
      ],
    }],
    'boundaries/no-unknown': [2],
    'boundaries/no-unknown-files': [2],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
    'boundaries/elements': [
      // Define module boundaries based on directory structure
      {
        type: 'core',
        pattern: 'src/core/**/*',
        mode: 'file',
      },
      {
        type: 'services',
        pattern: 'src/services/**/*',
        mode: 'file',
      },
      {
        type: 'ui',
        pattern: 'src/ui/**/*',
        mode: 'file',
      },
      {
        type: 'views',
        pattern: 'src/views/**/*',
        mode: 'file',
      },
      {
        type: 'utils',
        pattern: 'src/utils/**/*',
        mode: 'file',
      },
    ],
    'boundaries/ignore': [
      // Ignore test files and configuration
      'src/**/__tests__/**/*',
      'src/**/__mocks__/**/*',
      '**/*.test.js',
      '**/*.spec.js',
      '**/config.js',
      '**/index.js',
      '**/index.ts',
    ],
  },
  overrides: [
    {
      // More relaxed rules for test files
      files: ['**/__tests__/**/*', '**/*.test.js', '**/*.spec.js', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'boundaries/element-types': 'off',
        'boundaries/entry-point': 'off',
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      },
    },
    {
      // Configuration files can be more flexible
      files: ['**/config.js', '**/*.config.js'],
      rules: {
        'boundaries/element-types': 'off',
        'boundaries/entry-point': 'off',
      },
    },
  ],
};