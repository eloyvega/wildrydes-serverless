# WildRydes con Serverless

Taller de introducción al [Framework Serverless](https://serverless.com) usando el taller de AWS de [WildRydes](https://aws.amazon.com/getting-started/projects/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/) como ejemplo.

## Información general

En este tutorial, creará una sencilla aplicación web sin servidor que permite a los usuarios solicitar paseos en unicornio de la flota de Wild Rydes. La aplicación presentará a los usuarios una interfaz basada en HTML para indicar la ubicación en la que desean que se les recoja e interactuará en el backend con un servicio web RESTful para enviar la solicitud y enviar un unicornio cercano. La aplicación también permitirá a los usuarios registrarse al servicio e iniciar sesión antes de solicitar paseos.

## Arquitectura

La arquitectura de la aplicación utiliza AWS Lambda, Amazon API Gateway, Amazon S3, Amazon DynamoDB y Amazon Cognito, como se muestra a continuación:

![Arquitectura](https://d1.awsstatic.com/Test%20Images/Kate%20Test%20Images/Serverless_Web_App_LP_assets-16.7cbed9781201a79b9efa761807c4312e68b23485.png)

1. **Alojamiento web estático**: Amazon S3 aloja recursos web estáticos como HTML, CSS, JavaScript y archivos de imagen que se cargan en el navegador del usuario.

2. **Administración de usuarios**: Amazon Cognito proporciona funciones de administración y autenticación de usuarios para proteger la API de backend.

3. **Backend sin servidor**: Amazon DynamoDB proporciona una capa de persistencia donde los datos se pueden almacenar mediante la función Lambda de la API.

4) **API RESTful**: El código JavaScript ejecutado en el navegador envía y recibe datos de una API de backend pública creada mediante Lambda y API Gateway.

## Preparación del ambiente

Desplegar IDE de Cloud9 con este repositorio en la región us-east-1 (N. Virginia):

[![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/new?stackName=wildrydes-serverless-env&templateURL=https://cloudtitlan-public-cfn-templates.s3.amazonaws.com/wildrydes-serverless.yaml)

En tu terminal, dirígete hacia el directorio del repositorio. Todos las instrucciones se realizaran con relación a esta ubicación:

```
cd wildrydes-serverless
```

Serverless es una herramienta de consola (CLI) desarrollada con NodeJS y se instala con npm de la siguiente forma:

```
npm install -g serverless
```

## Taller

### 01. Inicializar proyecto serverless

Crearemos nuestro archivo `serverless.yml` que contiene la descripción de nuestra aplicación y haremos nuestro primer despliegue.

**a.** Click derecho en nuestro directorio `wildrydes-serverless` y selecciona `New File`

**b.** Nombrar el nuevo archivo con el nombre `serverless.yml`

**c.** Abrir nuestro nuevo archivo `serverless.yml` y pegar el siguiente contenido:

```yaml
service: wildrydes-serverless

provider:
  name: aws
  runtime: nodejs10.x
  region: us-east-1
  stage: dev
```

Este es una definición vacía de un servicio serverless, trabajaremos con este archivo el resto del taller. Por el momento podemos ver que esta definición solo cuenta con dos secciones: `service` y `provider`.

**d.** Desplegar este servicio con el siguiente comando

```
serverless deploy
```

El framework se encarga de compilar nuestra definición en un stack de CloudFormation y lo despliega en nuestra cuenta de AWS. Como la definición de nuestro servicio aún no cuenta con recursos, la salida de este comando es un servicio vacío:

```
Service Information
service: wildrydes-serverless
stage: dev
region: us-east-1
stack: wildrydes-serverless-dev
resources: 1
api keys:
  None
endpoints:
  None
functions:
  None
layers:
  None
```

¡Felicidades! has creado tu primer servicio con el framework Serverless y lo has desplegado a tu cuenta de AWS. Aunque por el momento no cuenta con ningún recurso, en los siguiente módulos exploraremos las diferentes opciones de este framework para desplegar las diferentes partes de nuestra aplicación.

### 02. Alojar un sitio Web Estático

En este módulo configurará Amazon Simple Storage Service (S3) para alojar los recursos estáticos de su aplicación web. En los módulos siguientes, añadirá funcionalidad dinámica a estas páginas mediante JavaScript para llamar a las API RESTful remotas creadas con AWS Lambda y Amazon API Gateway.

Serverless cuenta con un ecosistema de plugins que extienden la funcionalidad del framework. En este módulo utilizarás el plugin `serverless-finch` que facilita la creación y administración de infraestructura para alojar un sitio web con S3.

**a.** Ejecutar el siguiente comando para instalar el plugin:

```
sls plugin install -n serverless-finch
```

Serverless modifica nuestro archivo yaml para incluir la sección de plugins, verifica que tu archivo `serverless.yml` tenga el siguiente contenido:

```yaml
plugins:
  - serverless-finch
```

En tu directorio verás dos nuevos archivos que contienen la información del plugin que acabamos de instalar, `package.json` y `package-lock.json`.

**b.** Una vez instalado el plugin, necesitamos configurarlo para indicar la ubicación de nuestros archivos HTML, CSS y JS que conforman nuestro sitio web. También debemos especificar el nombre del bucket de S3 que almacenará nuestros archivos.

Modifica el archivo `serverless.yml` con la nueva sección `custom` y los siguientes valores:

```yaml
custom:
  client:
    bucketName: wildrydes-serverless-firstname-lastname
    distributionFolder: website
```

La llave `client` contiene las configuraciones del plugin `serverless-finch`. El atributo `bucketName` debe ser un nombre único en todo el espacio de nombres de S3, sustituye `firstname` y `lastname` con tu nombre y apellido, si al desplegar te marca un error de nombre, intenta agregando un número aleatorio al final.

`distributionFolder` es la ruta donde se encuentran los archivos estáticos que componen el sitio web. En este repositorio se encuentran dentro de la carpeta `website/`.

**c.** Para desplegar nuestro sitio web estático ocupamos la instrucción del plugin `serverless-finch` en nuestra línea de comandos:

```
serverless client deploy
```

Te pedira tu confirmación para crear el bucket, sus configuraciones y desplegar el contenido del sitio:

```
? Do you want to proceed? (Y/n)
```

Confirma con `y` y Enter.

**d.** Valida que tu sitio web se encuentra funcionando correctamente. Al terminar la ejecución del despliegue con `sls client deploy`, te mostrará dirección de tu sitio web de la siguiente forma (con una URL diferente):

```
Serverless: Success! Your site should be available at http://wildrydes-serverless-firstname-lastname.s3-website-us-east-1.amazonaws.com/
```

Visita la URL de tu sitio y valida que se muestra correctamente.

Otra forma de obtener la URL de tu sitio web es ir a la consola de AWS, entrar al servicio S3 y buscar el bucket con el nombre de la configuración `bucketName`. Entra al bucket y después a su sección `Properties`, da click en `Static website hosting` para ver la URL del sitio web y poder validar que se encuentra funcionando.

### 03. Administración de usuarios

En este módulo va a crear un grupo de usuarios de Amazon Cognito para administrar las cuentas de los usuarios. Implementará páginas que permiten a los clientes registrarse como nuevo usuario, verificar su dirección de correo electrónico e iniciar sesión en el sitio.

Serverless admite la creación de cualquier tipo de recursos de AWS a través de plantillas de CloudFormation, esto, con el uso de la sección `resources` dentro del archivo `serverless.yml`. A continuación crearemos un Cognito User Pool y un Cognito User Pool Client para permitir el registro e inicio de sesión de los usuarios de la aplicación.

**a.** Modifica el archivo `serverless.yml` para incluir la siguiente sección al final:

```yaml
resources:
  Resources:
    CognitoUserPool:
      Type: AWS::Cognito::UserPool
      Properties:
        UserPoolName: ${self:service}-${self:provider.stage}
        AutoVerifiedAttributes:
          - email
        Schema:
          - Mutable: false
            Name: email
            Required: true
    CognitoUserPoolClient:
      Type: AWS::Cognito::UserPoolClient
      Properties:
        ClientName: WildRydesWebApp
        UserPoolId:
          Ref: CognitoUserPool
        GenerateSecret: false
  Outputs:
    UserPoolId:
      Value:
        Ref: CognitoUserPool
    UserPoolArn:
      Value: !GetAtt CognitoUserPool.Arn
    UserPoolClientId:
      Value:
        Ref: CognitoUserPoolClient
```

Esta plantilla de CloudFormation crea un User Pool de Cognito y su Cliente. El nombre del User Pool es la interpolación del nombre de servicio y el ambiente del mismo, en este caso será `wildrydes-serverless-dev`.

**b.** Para desplegar los cambios de nuestro servicio es necesario ejecutar nuevamente el comando:

```
serverless deploy
```

**c.** Para obtener los IDs de Cognito ejecuta el siguiente comando:

```
serverless info --verbose
```

La salida es algo parecido a:

```
...
Stack Outputs
UserPoolClientId: 31sklak7jship8nngsvjjkvret
UserPoolId: us-east-1_6EIjfKMgO
ServerlessDeploymentBucketName: wildrydes-serverless-dev-serverlessdeploymentbuck-mfx9dzp7g0j8
```

Usaremos los valores de `UserPoolId` y `UserPoolClientId` en el siguiente paso.

**d.** Es necesario modificar el sitio web con los valores de nuestro Cognito User Pool para permitir el registro de nuevos usuarios. Actualiza el archivo `website/js/config.js` de la siguiente forma:

```js
window._config = {
  cognito: {
    userPoolId: "VALOR_DE_UserPoolId",
    userPoolClientId: "VALOR_DE_UserPoolClientId",
    region: "us-east-1"
  },
  api: {
    invokeUrl: ""
  }
};
```

Una vez guardados los cambios desplegamos nuevamente el sitio web con el comando:

```
serverless client deploy
```

**e.** Validamos la administración de usuarios desde nuestro sitio web. Visite `/register.html` en su dominio de sitio web o elija el botón `Giddy Up!` en la página de inicio de su sitio.

Complete el formulario de registro y elija Let's Ryde. Puede utilizar su correo electrónico o especificar uno falso. Asegúrese de elegir una contraseña que contenga al menos una letra en mayúsculas, un número y un carácter especial. No olvide la contraseña especificada, la necesitará más adelante. Debería ver una alerta que confirme que el usuario se ha creado.

Puede finalizar el proceso de verificación de cuenta si visita `/verify.html` en el dominio del sitio web e introduce el código de verificación que se le ha enviado por correo electrónico.

Después de confirmar el usuario nuevo con la página `/verify.html` o la consola de Cognito, visite `/signin.html` e inicie sesión con la dirección de correo electrónico y la contraseña que introdujo durante el paso de registro.

Si el proceso se desarrolla correctamente, se le redirigirá a `/ride.html`. Debería aparecer una notificación de que la API no está configurada.

### 04. Backend de servicios sin servidor

En este módulo vamos a utilizar AWS Lambda y Amazon DynamoDB para crear un proceso de backend destinado a administrar las solicitudes de su aplicación web. La aplicación de navegador que implementó en el primer módulo permite a los usuarios solicitar el envío de un objeto Unicorn a una ubicación de su elección. Para responder a esas solicitudes, el código JavaScript que se ejecuta en el navegador deberá invocar a un servicio que se ejecuta en la nube.

Para crear la tabla de DynamoDB extenderemos nuestra sección de `resources` en el archivo `serverless.yml` mientras que para la funcion Lambda exploraremos la nueva sección `functions`.

**a.** Añadir un nuevo recurso a la sección `resources` dentro de la llave `Resources` para crear la tabla de DynamoDB. A continuación se presenta toda la sección `resources`, nota como el recurso `DynamoTable` es el único campo nuevo en nuestro archivo:

```yaml
resources:
  Resources:
    CognitoUserPool:
      Type: AWS::Cognito::UserPool
      Properties:
        UserPoolName: ${self:service}-${self:provider.stage}
        AutoVerifiedAttributes:
          - email
        Schema:
          - Name: email
            Mutable: false
            Required: true
    CognitoUserPoolClient:
      Type: AWS::Cognito::UserPoolClient
      Properties:
        ClientName: WildRydesWebApp
        UserPoolId:
          Ref: CognitoUserPool
        GenerateSecret: false
    DynamoTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:service}-${self:provider.stage}
        ProvisionedThroughput:
          ReadCapacityUnits: "5"
          WriteCapacityUnits: "5"
        AttributeDefinitions:
          - AttributeName: "RideId"
            AttributeType: "S"
        KeySchema:
          - AttributeName: "RideId"
            KeyType: "HASH"
  Outputs:
    UserPoolId:
      Value:
        Ref: CognitoUserPool
    UserPoolArn:
      Value: !GetAtt CognitoUserPool.Arn
    UserPoolClientId:
      Value:
        Ref: CognitoUserPoolClient
```

**b.** Despliega los cambios para crear la tabla de DynamoDB:

```
serverless deploy
```

**c.** Para que la función Lambda (que crearemos en el siguiente paso) tenga permiso de escribir en la tabla de DynamoDB, es necesario agregar el atributo `iamRoleStatements` a nuestro servicio. Actualiza la sección `provider` del archivo `serverless.yml` con lo siguiente:

```yaml
provider:
  name: aws
  runtime: nodejs10.x
  stage: dev
  iamRoleStatements:
    - Effect: "Allow"
      Action:
        - "dynamodb:PutItem"
      Resource: !GetAtt DynamoTable.Arn
```

**d.** Desplegar la función Lambda requiere agregar nuevas secciones al archivo `serverless.yml`:

```yaml
functions:
  RequestUnicorn:
    handler: lambda_function/requestUnicorn.handler
    environment:
      dynamoTableName: ${self:service}-${self:provider.stage}

package:
  exclude:
    - website/**
```

El código de la función se encuentra en la carpeta `lambda_function/`, Serverless se encarga de empaquetarlo y subirlo a S3 y crear la función. La instrucción `package` nos ayuda a evitar desplegar el contenido del sitio web en nuestra función Lambda.

**e.** Desplegar nuestro servicio nuevamente:

```
serverless deploy
```

**f.** Para probar nuestra implementación:

- Ir a la consola de Lambda en AWS y buscar la función `wildrydes-serverless-dev-RequestUnicorn`.

- En la pantalla de edición principal de la función, seleccione Configure test event (Configurar evento de prueba) en el menú desplegable Select a test event... (Seleccionar un evento de prueba...).

- Mantenga seleccionada la opción Create new test event (Crear nuevo evento de prueba).

- Escriba TestRequestEvent en el campo Event name (Nombre del evento)

- Copie y pegue el siguiente evento de prueba en el editor:

```json
{
  "path": "/ride",
  "httpMethod": "POST",
  "headers": {
    "Accept": "*/*",
    "Authorization": "eyJraWQiOiJLTzRVMWZs",
    "content-type": "application/json; charset=UTF-8"
  },
  "queryStringParameters": null,
  "pathParameters": null,
  "requestContext": {
    "authorizer": {
      "claims": {
        "cognito:username": "the_username"
      }
    }
  },
  "body": "{\"PickupLocation\":{\"Latitude\":47.6174755835663,\"Longitude\":-122.28837066650185}}"
}
```

- Haga clic en Create (Crear).

- En la pantalla de edición de funciones principal, haga clic en Test (Prueba) con la opción `TestRequestEvent` seleccionada en el menú desplegable.

- Desplácese hacia la parte superior de la página y amplíe la sección Details (Detalles) de la sección Execution result (Resultado de la ejecución).

- Compruebe que la ejecución se ha realizado correctamente y que el resultado de la función es similar al siguiente:

```
{
    "statusCode": 201,
    "body": "{\"RideId\":\"SvLnijIAtg6inAFUBRT+Fg==\",\"Unicorn\":{\"Name\":\"Rocinante\",\"Color\":\"Yellow\",\"Gender\":\"Female\"},\"Eta\":\"30 seconds\"}",
    "headers": {
        "Access-Control-Allow-Origin": "*"
    }
}
```

### 05. Implementar una API RESTful

En este módulo utilizará Amazon API Gateway para exponer la función Lambda que creó en el módulo anterior como una API RESTful. Esta API estará disponible en el Internet público. Se protegerá mediante el grupo de usuarios de Amazon Cognito que creó en el módulo anterior. Con esta configuración convertirá su sitio web alojado estáticamente en una aplicación web dinámica al añadir código JavaScript en el lado del cliente que realiza llamadas AJAX a las API expuestas.

Crear APIs con Serverless es muy fácil, basta añadir eventos a nuestras funciones y el Framework se encarga de crear todos los recursos necesarios y sus conexiones.

**a.** Obtener el valor del ARN del User Pool de Cognito:

```
serverless info --verbose
```

Usaremos el valor de `UserPoolArn` en el siguiente paso.

**b.** Modifica la definición de la función con lo siguiente:

```yaml
functions:
  RequestUnicorn:
    handler: lambda_function/requestUnicorn.handler
    environment:
      dynamoTableName: ${self:service}-${self:provider.stage}
    events:
      - http:
          path: ride
          method: post
          cors: true
          authorizer:
            arn: VALOR_DE_UserPoolArn
```

**c.** Despliega la API con el siguiente comando

```
serverless deploy
```

Una vez terminado el deploy:

```
serverless info --verbose
```

Ocuparemos el valor de `ServiceEndpoint:` en el siguiente paso.

**d.** Actualiza el archivo `website/js/config.js`:

```js
window._config = {
  cognito: {
    userPoolId: "VALOR_DE_UserPoolId",
    userPoolClientId: "VALOR_DE_UserPoolClientId",
    region: "us-east-1"
  },
  api: {
    invokeUrl: "VALOR_DE_ServiceEndpoint"
  }
};
```

**e.** Actualizamos nuestro sitio web con:

```
serverless client deploy
```

Cuando pida confirmación escribe `y` y Enter.

**f.** Validar la implementación:

- Vaya a /ride.html ubicado en el dominio del sitio web.

- Si se le redirecciona a la página de inicio de sesión, inicie la sesión con el usuario que creó en el módulo anterior.

- Después de que se haya cargado el mapa, haga clic en cualquier lugar del mapa para establecer una ubicación de recogida.

- Elija Request Unicorn (Solicitar unicornio). Debe ver una notificación en la barra lateral derecha de que un unicornio está en camino y, a continuación, ver un icono de unicornio volando a su lugar de recogida.
