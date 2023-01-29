import { useState, useEffect, useRef } from 'react'

import {
  Flex,
  Heading,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Center,
} from '@chakra-ui/react'
import moment from 'moment'
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryStack,
  VictoryLabel,
} from 'victory'

import DemoLayout from 'src/layouts/DemoLayout/DemoLayout'

const DemoPage = () => {
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const [allCategories, setAllCategories] = useState([])
  const [category, setCategory] = useState()
  const [completedClues, setCompletedClues] = useState([])
  const [uniqueClue, setUniqueClue] = useState()
  const [revealed, setRevealed] = useState(false)
  const [currentClue, setCurrentClue] = useState()
  const stats = useRef({})
  const [dateString, setDateString] = useState()

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
    if (loading) {
      const { day, month, year } = randomDate(start, end)

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
            setCategory(categories[0])
            stats.current = {
              correct: categories
                .slice()
                .reverse()
                .map((category) => {
                  return { category: category, count: 0 }
                }),
              incorrect: categories
                .slice()
                .reverse()
                .map((category) => {
                  return { category: category, count: 0 }
                }),
              unanswered: categories
                .slice()
                .reverse()
                .map((category) => {
                  return { category: category, count: 0 }
                }),
            }
            setDateString(`${month}/${day}/${year}`)
          }
        })
    }
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

  if (loading)
    return (
      <Center height="100vh">
        <Flex my="auto" justify="space-around" direction="column" gap={6}>
          <Spinner size="xl" m="auto" />
          <Text fontSize="2xl" textAlign="center" m="auto">
            Finding a Jeopardy! game...
          </Text>
        </Flex>
      </Center>
    )

  if (completedClues.length === 60) return <div>{JSON.stringify(stats)}</div>

  return (
    <DemoLayout>
      <Flex direction="column" gap={2}>
        <Heading size="lg">Jeopardy!</Heading>
        <Text fontSize="xs">game from {dateString}</Text>
      </Flex>
      <Menu matchWidth={true}>
        <MenuButton as={Button}>{category}</MenuButton>
        <MenuList>
          {allCategories.map((categoryName, i) => (
            <MenuItem
              key={i}
              onClick={() => {
                setCategory(categoryName)
              }}
            >
              {categoryName}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      {category && (
        <Flex direction="column" gap={2}>
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
          <ModalHeader>{category}</ModalHeader>
          <ModalCloseButton
            onClick={() => {
              setRevealed(false)
              setCompletedClues([...completedClues, { [category]: uniqueClue }])
              stats.current.unanswered.find((e) => e.category === category)
                .count++
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
                    stats.current.correct.find((e) => e.category === category)
                      .count++
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
                    stats.current.incorrect.find((e) => e.category === category)
                      .count++
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
      {completedClues.length > 0 && (
        <VictoryChart domainPadding={8} theme={VictoryTheme.material}>
          <VictoryAxis tickFormat={() => ''} />
          <VictoryAxis tickFormat={[1, 2, 3, 4, 5]} dependentAxis />
          <VictoryStack
            horizontal
            colorScale={['grey', 'red', 'green']}
            labels={allCategories.slice().reverse()}
            labelComponent={<VictoryLabel dy={-16} dx={55} x={0} />}
            animate={{
              duration: 500,
              onLoad: { duration: 500 },
            }}
          >
            <VictoryBar
              data={stats.current.unanswered}
              x="category"
              y={(data) => data.count}
            />
            <VictoryBar
              data={stats.current.incorrect}
              x="category"
              y={(data) => data.count}
            />
            <VictoryBar
              data={stats.current.correct}
              x="category"
              y={(data) => data.count}
            />
          </VictoryStack>
        </VictoryChart>
      )}
    </DemoLayout>
  )
}

export default DemoPage
