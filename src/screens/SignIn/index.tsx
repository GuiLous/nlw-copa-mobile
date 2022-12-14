import { Center, Icon, Text } from "native-base";
import { Fontisto } from '@expo/vector-icons'

import Logo from '../../assets/logo.svg';
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/Button";

export function SignIn() {
  const {signIn, isUserLoading} = useAuth()

  return (
    <Center 
      flex={1} 
      bgColor='gray.900'
      p={7}
    >
     <Logo width={212} height={40} />

     <Button 
        type="SECONDARY"
        title="ENTRAR COM O GOOGLE"
        leftIcon={ <Icon as={Fontisto} name="google" color='white' size='md'/>}
        mt={12}
        onPress={signIn}
        isLoading={isUserLoading}
        _loading={{ _spinner: {color: 'white'}}}
        disabled={isUserLoading}
     />

     <Text
      color="white"
      textAlign="center"
      mt={4}
     >
        Não utilizamos nenhuma informação além do seu {'\n'}
        e-mail para a criação de sua conta.
     </Text>
    </Center>
  )
}
