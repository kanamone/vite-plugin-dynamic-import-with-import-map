import React, { useCallback } from 'react'

console.log("vite")
export const Foo: React.FC = () => {
  const foo = useCallback(() => {
    console.log("hello")
  }, [])
  return <p onClick={foo}>hello</p>
}
