import MessageForm from 'components/MessageForm';
import MessagesList from 'components/MessageList';
import { MessagesProvider } from 'utils/useMessages';
import Layout from '../components/Layout';


const IndexPage = () => {
  return (
    <MessagesProvider>
      <Layout>
        <MessagesList />
        <div className="fixed bottom-0 right-0 left-0">
         
          <MessageForm />
        </div>
      </Layout>
    </MessagesProvider>
  );
};

export default IndexPage;
