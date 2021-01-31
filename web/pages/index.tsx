import Head from 'next/head'
import Link from 'next/link'
import { withSSRContext } from 'aws-amplify';
import { listNotes } from '../../app/lib/notes/statements'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api'
import Layout from 'components/Layout'
import Amplify from 'aws-amplify'
import awsConfig from '../aws-exports'
Amplify.configure({...awsConfig, ssr: true});

export default function Home({ posts }) {
  return (
    <Layout>
      <Head>
        <title>Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {
       posts.map(post => (
        <div key={post.id} className="bg-white overflow-hidden shadow sm:rounded-lg mt-4">
          <div className="px-4 py-5 sm:p-6">
            <Link href={`/notes/[id]`} as={`/notes/${post.id}`}>
              <div className="prose lg:prose-xl">
                <h2>{post.title}</h2>
                <div>{post.body}</div>
              </div>
            </Link>
          </div>
        </div>
       ))
     }
    </Layout>
  )
}

export async function getStaticProps() {
  const SSR = withSSRContext()
  let postData;

  try {
    postData = await SSR.API.graphql({ query: listNotes, authMode: GRAPHQL_AUTH_MODE.API_KEY });
  }
  catch (e) {
    console.log(e)
  }

  if (postData.data.listNotes) {
    return {
      props: {
        posts: postData.data.listNotes.items,
      },
      // Next.js will attempt to re-generate the page:
      // - When a request comes in
      // - At most once every second
      revalidate: 120, // In seconds
    }
  }
}

