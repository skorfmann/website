export const fullNoteFragment = /* GraphQL */ `
  fragment FullNote on Note {
    id
    title
    body
    tags
    createdAt
    updatedAt
  }
`

export const listNotes = /* GraphQL */ `
  ${fullNoteFragment}

  query listNotes {
    listNotes(limit: 10) {
      items {
        ... FullNote
      }
      nextToken
    }
  }
`

export const getNote = /* GraphQL */ `
  ${fullNoteFragment}

  query getNote($id: ID!) {
    getNote(id: $id) {
      ... FullNote
    }
  }
`

export const createNote = /* GraphQL */ `
  ${fullNoteFragment}

  mutation createNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      ... FullNote
    }
  }
`