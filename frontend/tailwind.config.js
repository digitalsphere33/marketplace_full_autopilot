export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
         brand: {
           DEFAULT: '#1D4ED8',
           50: '#EEF2FF',
           100: '#E0E7FF',
           200: '#C7D2FE',
           300: '#A5B4FC',
           400: '#818CF8',
           500: '#6366F1',
           600: '#4F46E5',
         },
         accent: {
           DEFAULT: '#06B6D4',
           50: '#ECFEFF',
           100: '#CFFAFE',
           200: '#99F6FF',
           300: '#67E8F9',
           400: '#22D3EE',
           500: '#06B6D4'
         },
         neutral: {
           DEFAULT: '#374151',
           100: '#F3F4F6',
           200: '#E5E7EB',
           300: '#D1D5DB',
           400: '#9CA3AF',
           500: '#6B7280'
         }      
       }
    }
  },
  plugins: [],
};