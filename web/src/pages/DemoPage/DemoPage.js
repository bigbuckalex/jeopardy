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
  const [allCategories, setAllCategories] = useState([])
  const [category, setCategory] = useState()
  const [completedClues, setCompletedClues] = useState([])
  const [uniqueClue, setUniqueClue] = useState()
  const [revealed, setRevealed] = useState(false)
  const [currentClue, setCurrentClue] = useState()
  const [stats, setStats] = useState({})

  const { isOpen, onOpen, onClose } = useDisclosure()

  const start = new Date(2002, 0, 1)
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
            const categories = []
            for (let i = 0; i < 6; i++) {
              categories.push(data.jeopardy[i].category)
            }
            setAllCategories(categories)
          }
        })
  }

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setCurrentClue(() => {
      return data?.jeopardy?.find(
        (clue) => clue.category === category && clue.clue === uniqueClue
      )
    })
  }, [data, category, uniqueClue])

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
              {allCategories.map((categoryName, i) => (
                <MenuItem key={i} onClick={() => setCategory(categoryName)}>
                  {categoryName}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          {category && (
            <Flex direction="column">
              {data?.jeopardy
                ?.filter((e) => e.category === category)
                .map((e, i) => {
                  const disabled = completedClues.some(
                    (clue) => clue[category] === e.clue
                  )
                  return (
                    <Button
                      key={i}
                      onClick={() => {
                        setUniqueClue(e.clue)
                        onOpen()
                      }}
                      disabled={disabled}
                    >
                      ${(i + 1) * 200}
                    </Button>
                  )
                })}
            </Flex>
          )}
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            closeOnEsc={false}
            closeOnOverlayClick={false}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={false}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader />
              <ModalCloseButton
                onClick={() => {
                  setRevealed(false)
                  setCompletedClues([
                    ...completedClues,
                    { [category]: uniqueClue },
                  ])
                }}
              />
              <ModalBody>
                <Text>
                  {currentClue?.clue === 'Unrevealed'
                    ? 'Sorry, this clue was not revealed during airing. Close this window to continue playing.'
                    : currentClue?.clue}
                </Text>
                <Text as="b" visibility={!revealed && 'hidden'}>
                  {currentClue?.answer}
                </Text>
              </ModalBody>

              <ModalFooter>
                {revealed && (
                  <>
                    <Button
                      colorScheme="green"
                      mr={3}
                      onClick={() => {
                        setRevealed(false)
                        setCompletedClues([
                          ...completedClues,
                          { [category]: uniqueClue },
                        ])
                        if (stats[category]?.correct) {
                          const prevCorrect = stats[category].correct
                          setStats({
                            ...stats,
                            [category]: {
                              ...stats[category],
                              correct: prevCorrect + 1,
                            },
                          })
                        } else {
                          setStats({
                            ...stats,
                            [category]: { ...stats[category], correct: 1 },
                          })
                        }
                        onClose()
                      }}
                    >
                      Correct
                    </Button>
                    <Button
                      colorScheme="red"
                      mr={3}
                      onClick={() => {
                        setRevealed(false)
                        setCompletedClues([
                          ...completedClues,
                          { [category]: uniqueClue },
                        ])
                        if (stats[category]?.incorrect) {
                          const prevIncorrect = stats[category].incorrect
                          setStats({
                            ...stats,
                            [category]: {
                              ...stats[category],
                              incorrect: prevIncorrect + 1,
                            },
                          })
                        } else {
                          setStats({
                            ...stats,
                            [category]: { ...stats[category], incorrect: 1 },
                          })
                        }
                        onClose()
                      }}
                    >
                      Incorrect
                    </Button>
                  </>
                )}
                <Button
                  varient="ghost"
                  disabled={currentClue?.clue === 'Unrevealed'}
                  onClick={() => {
                    setRevealed(true)
                  }}
                >
                  Reveal Answer
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          {JSON.stringify(stats)}
        </>
      )}
    </>
  )
}

export default DemoPage
