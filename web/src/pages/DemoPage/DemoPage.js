import { useState, useEffect } from 'react'

import { ChevronDownIcon } from '@chakra-ui/icons'
import {
  Flex,
  Heading,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import moment from 'moment'

import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

const DemoPage = () => {
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState()
  const [value, setValue] = useState()
  const [revealed, setRevealed] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const start = new Date(2001, 0, 1)
  const end = new Date()

  const randomDate = (start, end) => {
    const date = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    )
    const month = moment(date).format('MM')
    const day = moment(date).format('DD')
    const year = moment(date).format('YYYY')
    return { day, month, year }
  }

  const getData = () => {
    const { day, month, year } = randomDate(start, end)
    loading &&
      fetch(`https://jarchive-json.glitch.me/game/${month}/${day}/${year}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            console.log(data.message)
            getData()
          } else {
            setLoading(false)
            console.log(data)
            setData(data)
          }
        })
  }

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <MetaTags title="Demo" description="Demo page" />

      <h1>DemoPage</h1>
      {loading ? (
        <p>loading...</p>
      ) : (
        <>
          <Menu>
            <Heading size="lg">{category}</Heading>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Category
            </MenuButton>
            <MenuList>
              <MenuItem
                onClick={() => setCategory(data?.jeopardy[0]?.category)}
              >
                {data?.jeopardy[0]?.category}
              </MenuItem>
              <MenuItem
                onClick={() => setCategory(data?.jeopardy[1]?.category)}
              >
                {data?.jeopardy[1]?.category}
              </MenuItem>
              <MenuItem
                onClick={() => setCategory(data?.jeopardy[2]?.category)}
              >
                {data?.jeopardy[2]?.category}
              </MenuItem>
              <MenuItem
                onClick={() => setCategory(data?.jeopardy[3]?.category)}
              >
                {data?.jeopardy[3]?.category}
              </MenuItem>
              <MenuItem
                onClick={() => setCategory(data?.jeopardy[4]?.category)}
              >
                {data?.jeopardy[4]?.category}
              </MenuItem>
              <MenuItem
                onClick={() => setCategory(data?.jeopardy[5]?.category)}
              >
                {data?.jeopardy[5]?.category}
              </MenuItem>
            </MenuList>
          </Menu>
          {category && (
            <Flex direction="column">
              <Button
                onClick={() => {
                  setValue(200)
                  onOpen()
                }}
              >
                $200
              </Button>
              <Button
                onClick={() => {
                  setValue(400)
                  onOpen()
                }}
              >
                $400
              </Button>
              <Button
                onClick={() => {
                  setValue(600)
                  onOpen()
                }}
              >
                $600
              </Button>
              <Button
                onClick={() => {
                  setValue(800)
                  onOpen()
                }}
              >
                $800
              </Button>
              <Button
                onClick={() => {
                  setValue(1000)
                  onOpen()
                }}
              >
                $1000
              </Button>
            </Flex>
          )}
          <Modal
            isOpen={isOpen}
            onClose={() => {
              setRevealed(false)
              onClose()
            }}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader />
              <ModalCloseButton />
              <ModalBody>
                <Text>
                  {
                    data?.jeopardy?.find(
                      (clue) =>
                        clue.category === category && clue.value === value
                    )?.clue
                  }
                </Text>
                <Text as="b" visibility={!revealed && 'hidden'}>
                  {
                    data?.jeopardy?.find(
                      (clue) =>
                        clue.category === category && clue.value === value
                    )?.answer
                  }
                </Text>
              </ModalBody>

              <ModalFooter>
                {revealed && (
                  <>
                    <Button colorScheme="green" mr={3}>
                      Correct
                    </Button>
                    <Button colorScheme="red" mr={3}>
                      Incorrect
                    </Button>
                  </>
                )}
                <Button
                  varient="ghost"
                  onClick={() => {
                    setRevealed(true)
                  }}
                >
                  Reveal Answer
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          {category}
          {value}
        </>
      )}
    </>
  )
}

export default DemoPage
