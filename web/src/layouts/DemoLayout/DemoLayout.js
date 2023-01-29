import { Container, Flex } from '@chakra-ui/react'

const DemoLayout = ({ children }) => {
  return (
    <Container minHeight="100vh" maxWidth="sm" textAlign="center" my={6}>
      <Flex direction="column" gap={6}>
        {children}
      </Flex>
    </Container>
  )
}

export default DemoLayout
