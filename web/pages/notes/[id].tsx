import { useRouter } from 'next/router'
import { getNote, listNotes } from '../../../app/lib/notes/statements'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api'
import Layout from 'components/Layout'
import { withSSRContext } from 'aws-amplify';
import Amplify from 'aws-amplify'
import awsConfig from '../../aws-exports'
Amplify.configure({...awsConfig, ssr: true});

const Note = ({ note, error, exception }) => {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>error: {exception}</div>
  }

  return <Layout>
    <div>
      { note.title }
    </div>

  </Layout>
}

export default Note

// This function gets called at build time
export async function getStaticPaths() {
  const SSR = withSSRContext()

  let postData;

  try {
    postData = await SSR.API.graphql({ query: listNotes, authMode: GRAPHQL_AUTH_MODE.API_KEY, });
  } catch(e) {
    console.log(e)
    return;
  }

  if (postData.data.listNotes) {
    // Get the paths we want to pre-render based on posts
    const paths = postData.data.listNotes.items.map((post) => ({
      params: { id: post.id },
    }))

    // We'll pre-render only these paths at build time.
    // { fallback: false } means other routes should 404.
    return { paths, fallback: true }
  }
}

// This also gets called at build time
export async function getStaticProps({ params }) {
  const SSR = withSSRContext()

  // params contains the post `id`.
  // If the route is like /posts/1, then params.id is 1
  let postData;

  try {
    postData = await SSR.API.graphql({ query: getNote, variables: { id: params.id }, authMode: GRAPHQL_AUTH_MODE.API_KEY, });
  } catch(e) {
    console.log(e)
    return {
      props: {note: null, error: true, exception: e, statusCode: '500'}
    }
  }

  if (postData.data.getNote) {
    return { props: { note: postData.data.getNote }, revalidate: 1 }
  } else {
    return {
      props: {note: null, error: true, exception: `no data in ${postData}`, statusCode: '500'}
    }
  }
}
