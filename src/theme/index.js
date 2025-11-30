// src/theme/index.js
import { theme as baseTheme, extendTheme } from '@chakra-ui/react'

const theme = {
  ...baseTheme,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  }
}

export default extendTheme(theme)