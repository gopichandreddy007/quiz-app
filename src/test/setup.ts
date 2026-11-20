// adds matchers like toBeInTheDocument() and toBeDisabled()
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// remove rendered components and saved data between tests
afterEach(() => {
  cleanup()
  localStorage.clear()
})
