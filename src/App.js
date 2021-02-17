import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState} from 'react'
import API, { graphqlOperation } from '@aws-amplify/api';
import { messagesByChannelId } from './graphql/queries';
import '@aws-amplify/pubsub';
import { onCreateMessage } from './graphql/subscriptions';
import { createMessage } from './graphql/mutations';
import awsExports from './aws-exports';

function App() {

const [messages, setMessages] = useState([]);
const [messageBody, setMessageBody] = useState('');

useEffect(() => {
  API
    .graphql(graphqlOperation(messagesByChannelId, {
      channelID: '1',
      sortDirection: 'ASC'
    }))
    .then((response) => {
      const items = response?.data?.messagesByChannelID?.items;

      if (items) {
        setMessages(items);
      }
    })
}, []);
useEffect(() => {
  const subscription = API
    .graphql(graphqlOperation(onCreateMessage))
    .subscribe({
      next: (event) => {
        setMessages([...messages, event.value.data.onCreateMessage]);
      }
    });
  
  return () => {
    subscription.unsubscribe();
  };
}, [messages]);
  
  // Placeholder function for handling changes to our chat bar
  const handleChange = (event) => {
    setMessageBody(event.target.value);
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
  
    const input = {
      channelID: '1',
      author: 'Dave',
      body: messageBody.trim()
    };
  
    try {
      setMessageBody('');
      await API.graphql(graphqlOperation(createMessage, { input }))
    } catch (error) {
      console.warn(error);
    }
  };
  
  return (
    <div className="container">
      <div className="messages">
        <div className="messages-scroller">
        {messages.map((message) => (
  <div
    key={message.id}
    className={message.author === 'Dave' ? 'message me' : 'message'}>{message.body}</div>
))}
        </div>
      </div>
      <div className="chat-bar">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="message"
            placeholder="Type your message here"
            onChange={handleChange}
            value={messageBody}
          />
        </form>
      </div>
    </div>
  );
};

export default App;