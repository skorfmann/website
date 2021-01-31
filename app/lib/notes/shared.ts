export const Gsi = {
  byAuthor: {
    name: 'byAuthor',
    partitionKey: 'authorId',
    sortKey: 'title'
  },
  allByDate: {
    name: 'allByDate',
    partitionKey: 'scannable',
    sortKey: 'id'
  }
}
