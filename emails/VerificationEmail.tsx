import {
  Html,
  Head,
  Preview,
  Heading,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({
  username,
  otp,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>{" "}
      <Section
        style={{
          padding: "30px",
          fontFamily: "Arial, sans-serif",
          background: "#f8fafc",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <Heading
          style={{
            textAlign: "center",
            fontSize: "24px",
            color: "#2563eb",
            margin: "0 0 16px",
          }}
        >
          Welcome to AnonyChat, {username}!
        </Heading>
        <Text
          style={{
            textAlign: "center",
            marginTop: "16px",
            color: "#334155",
            fontSize: "16px",
          }}
        >
          Please use the following code to verify your email address:
        </Text>
        <Row
          style={{
            justifyContent: "center",
            marginTop: "24px",
            marginBottom: "24px",
          }}
        >
          <Column align="center">
            <Text
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#2563eb",
                textAlign: "center",
                padding: "12px 24px",
                background: "#eff6ff",
                borderRadius: "8px",
                letterSpacing: "0.1em",
              }}
            >
              {otp}
            </Text>
          </Column>
        </Row>
        <Text
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            color: "#64748b",
          }}
        >
          If you did not request this verification, please ignore this email.
        </Text>
        <Text
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "12px",
            color: "#94a3b8",
          }}
        >
          &copy; {new Date().getFullYear()} AnonyChat. All rights reserved.
        </Text>
      </Section>
    </Html>
  );
}
