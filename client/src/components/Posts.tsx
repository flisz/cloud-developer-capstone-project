import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createPost, deletePost, getPosts, patchPost } from '../api/posts-api'
import Auth from '../auth/Auth'
import { Post } from '../types/Post'

interface PostsProps {
  auth: Auth
  history: History
}

interface PostsState {
  posts: Post[]
  newPostName: string
  loadingPosts: boolean
}

export class Posts extends React.PureComponent<PostsProps, PostsState> {
  state: PostsState = {
    posts: [],
    newPostName: '',
    loadingPosts: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPostName: event.target.value })
  }

  onEditButtonClick = (postId: string) => {
    this.props.history.push(`/posts/${postId}/edit`)
  }

  onPostCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newPost = await createPost(this.props.auth.getIdToken(), {
        title: this.state.newPostName
      })
      this.setState({
        posts: [...this.state.posts, newPost],
        newPostName: ''
      })
    } catch {
      alert('Post creation failed')
    }
  }

  onPostDelete = async (postId: string) => {
    try {
      await deletePost(this.props.auth.getIdToken(), postId)
      this.setState({
        posts: this.state.posts.filter(post => post.postId !== postId)
      })
    } catch {
      alert('Post deletion failed')
    }
  }

  onPostCheck = async (pos: number) => {
    try {
      const post = this.state.posts[pos]
      await patchPost(this.props.auth.getIdToken(), post.postId, {
        title: post.title,
        publish: !post.publish
      })
      this.setState({
        posts: update(this.state.posts, {
          [pos]: { publish: { $set: !post.publish } }
        })
      })
    } catch {
      alert('Post deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const posts = await getPosts(this.props.auth.getIdToken())
      this.setState({
        posts,
        loadingPosts: false
      })
    } catch (e) {
      alert(`Failed to fetch posts: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">User Posts</Header>

        {this.renderCreatePostInput()}

        {this.renderPosts()}
      </div>
    )
  }

  renderCreatePostInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onPostCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderPosts() {
    if (this.state.loadingPosts) {
      return this.renderLoading()
    }

    return this.renderPostsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Posts
        </Loader>
      </Grid.Row>
    )
  }

  renderPostsList() {
    return (
      <Grid padded>
        {this.state.posts.map((post, pos) => {
          return (
            <Grid.Row key={post.postId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onPostCheck(pos)}
                  checked={post.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {post.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {post.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(post.postId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onPostDelete(post.postId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {post.attachmentUrl && (
                <Image src={post.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
