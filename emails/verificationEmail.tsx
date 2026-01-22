import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface VerificationEmailProps {
  username?: string;
  otp: string;
  codeFor: "signup" | "forgotpassword";
}

export default function VerificationEmail({ username, otp, codeFor }: VerificationEmailProps) {
 
  
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <style>
          {`
            body {
              background-color: #181818;
              color: #F2F2F2;
              font-family: 'Roboto', Verdana, sans-serif;
            }
            .container {
              background-color: #242424;
              border-radius: 12px;
              padding: 40px;
              margin: 40px auto;
              max-width: 600px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              background: linear-gradient(90deg, #FB923C, #D97706);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 24px;
              text-align: center;
              display: block;
            }
            .heading {
              font-size: 20px;
              font-weight: 600;
              color: #F2F2F2;
              margin-bottom: 16px;
            }
            .text {
              font-size: 16px;
              line-height: 1.5;
              color: #B0B0B0;
              margin-bottom: 24px;
            }
            .otp-container {
              background-color: #181818;
              border-radius: 8px;
              padding: 16px;
              text-align: center;
              margin-bottom: 24px;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .otp {
              font-size: 32px;
              font-weight: bold;
              color: #FB923C;
              letter-spacing: 4px;
            }
            .footer {
              font-size: 12px;
              color: #666;
              text-align: center;
              margin-top: 32px;
            }
          `}
        </style>
      </Head>
      <Preview>Your Mysterious Verification Code: {otp}</Preview>
      <Section className="container">
        <Text className="logo">Mystery Message</Text>

        {codeFor === "signup" ? (
          <>
            <Heading as="h2" className="heading">Welcome to the Shadows, {username}!</Heading>
            <Text className="text">
              We're excited to have you join our world of anonymous feedback.
              To confirm your identity and start your journey, please use the verification code below.
            </Text>
          </>
        ) : (
          <>
            <Heading as="h2" className="heading">Reset Your Password</Heading>
            <Text className="text">
              Received a request to reset your password? No worries.
              Use the mysterious code below to securely get back into your account.
            </Text>
          </>
        )}

        <Section className="otp-container flex flex-row justify-around">
          <Text className="otp">{otp}</Text>
        </Section>

        <Text className="text">
          If you didn't request this code, you can safely ignore this email. Someone might have typed your email by mistake.
        </Text>

        <Text className="footer">
          © {new Date().getFullYear()} Mystery Message. Stay Anonymous.
        </Text>
      </Section>
    </Html>
  );
}

