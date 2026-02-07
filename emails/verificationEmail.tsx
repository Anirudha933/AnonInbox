import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Section,
  Text,
} from "@react-email/components";

interface VerificationEmailProps {
  username?: string;
  otp: string;
  codeFor: "signup" | "forgotpassword";
}

export default function VerificationEmail({
  username,
  otp,
  codeFor,
}: VerificationEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
        />
      </Head>

      <Preview>Your verification code: {otp}</Preview>

      <Section
        style={{
          backgroundColor: "#181818",
          padding: "40px 0",
          fontFamily: "Verdana, Roboto, sans-serif",
        }}
      >
        <Section
          style={{
            backgroundColor: "#242424",
            borderRadius: "12px",
            padding: "40px",
            margin: "0 auto",
            maxWidth: "600px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Text
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "24px",
              color: "#FB923C",
            }}
          >
            Mystery Message
          </Text>

          {codeFor === "signup" ? (
            <>
              <Heading as="h2" style={{ color: "#F2F2F2" }}>
                Welcome{username ? `, ${username}` : ""}!
              </Heading>
              <Text style={{ color: "#B0B0B0", fontSize: "16px" }}>
                Use the verification code below to complete your signup.
              </Text>
            </>
          ) : (
            <>
              <Heading as="h2" style={{ color: "#F2F2F2" }}>
                Reset Your Password
              </Heading>
              <Text style={{ color: "#B0B0B0", fontSize: "16px" }}>
                Use the verification code below to reset your password.
              </Text>
            </>
          )}

          <Section
            style={{
              backgroundColor: "#181818",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
              margin: "24px 0",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Text
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                letterSpacing: "4px",
                color: "#FB923C",
                margin: 0,
              }}
            >
              {otp}
            </Text>
          </Section>

          <Text style={{ color: "#B0B0B0", fontSize: "14px" }}>
            If you didn’t request this code, you can safely ignore this email.
          </Text>

          <Text
            style={{
              marginTop: "32px",
              fontSize: "12px",
              color: "#666",
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} Mystery Message
          </Text>
        </Section>
      </Section>
    </Html>
  );
}
