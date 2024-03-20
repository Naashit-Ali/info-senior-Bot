import 'styles/globals.css';
import 'styles/tailwind.css';
import { ModalProvider, ToastProvider } from '@apideck/components';

import { ChakraProvider } from '@chakra-ui/react'
import { AppProps } from 'next/app';

export default function App({ Component, pageProps }) {
  return (
    <ChakraProvider>

    <ToastProvider>
      <ModalProvider>
        <Component {...pageProps} />
      </ModalProvider>
    </ToastProvider>
    </ChakraProvider>
  );
}
