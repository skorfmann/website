import { useState, useEffect } from 'react'
import { Auth } from 'aws-amplify'
import { useRouter } from 'next/router'
import { API } from "aws-amplify";
import { createNote } from '../../app/lib/notes/statements'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api'
import * as React from 'react';
import { Formik, Field, Form } from 'formik';
import { compiler } from 'markdown-to-jsx';
import { NoteSchema, NoteInput } from '../../app/lib/notes/resolver/create-note'
import Layout from '../components/Layout'

import Amplify from 'aws-amplify'
import awsConfig from '../aws-exports'
Amplify.configure({...awsConfig});


const NewPostForm = ({}) => {
  const router = useRouter()

  return <Layout>
    <Formik
      initialValues={{
        title: '',
        body: '',
        tags: []
      }}
      validationSchema={NoteSchema}
      onSubmit={async (
        values: NoteInput
      ) => {
        const noteData: any = await API.graphql({query: createNote, variables: {input: values}, authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS});

        if (noteData.data.createNote) {
          router.push(`/notes/${noteData.data.createNote.id}`)
        }
      }}
    >
      {({ isSubmitting, errors, touched, values }) => (
        <>
          <Form className="space-y-8 divide-y divide-gray-200">
            <div className="space-y-8 divide-y divide-gray-200">
              <div>
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    New Post
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Publish a new post
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <div className="mt-1">
                      <Field type="text" id="title" name="title" placeholder="Post Title" className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"/>
                    {errors.title && touched.title ? (
                      <span>{errors.title}</span>
                    ) : null }
                    </div>
                  </div>

                </div>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                      Body
                    </label>
                    <div className="mt-1">
                      <Field as="textarea" id="body" name="body" placeholder="Post Body" className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300" />
                      {errors.body && touched.body ? (
                        <span>{errors.body}</span>
                      ) : null }
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting}>Submit</button>
            </div>
          </Form>

          <div>
            { compiler(values.body) }
          </div>
        </>
      )}
    </Formik>
  </Layout>
}

function ProtectedClient() {
  const [user, setUser] = useState(null)

  const router = useRouter()
  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => setUser(user))
      // if there is no authenticated user, redirect to profile page
      .catch(() => router.push('/profile'))
  }, [])

  if (!user) return null
  return <div>
    <NewPostForm />
  </div>
}

export default ProtectedClient