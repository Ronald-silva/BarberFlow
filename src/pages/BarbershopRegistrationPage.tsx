import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import {
  Card,
  CardContent,
  CardHeader,
  Heading,
  Text,
  Flex,
} from "../components/ui/Container";
import { supabase } from "../services/supabase";

const RegistrationContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.background.primary} 0%,
    ${(props) => props.theme.colors.background.secondary} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${(props) => props.theme.spacing[4]};
`;

const RegistrationCard = styled(Card)`
  width: 100%;
  max-width: 500px;
  box-shadow: ${(props) => props.theme.shadows.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    max-width: 100%;
    margin: 0;
  }
`;

const StepIndicator = styled.div<{ $active: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: ${(props) => props.theme.radii.full};
  background: ${(props) =>
    props.$active
      ? props.theme.colors.primary
      : props.theme.colors.background.tertiary};
  color: ${(props) =>
    props.$active
      ? props.theme.colors.text.inverse
      : props.theme.colors.text.tertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
`;

const StepContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing[3]};
  margin-bottom: ${(props) => props.theme.spacing[6]};
`;

const StepLine = styled.div<{ $completed: boolean }>`
  flex: 1;
  height: 2px;
  background: ${(props) =>
    props.$completed
      ? props.theme.colors.primary
      : props.theme.colors.border.primary};
  border-radius: ${(props) => props.theme.radii.full};
`;

interface BarbershopData {
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
}

interface AdminData {
  name: string;
  email: string;
  password: string;
}

const BarbershopRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [barbershopData, setBarbershopData] = useState<BarbershopData>({
    name: "",
    slug: "",
    address: "",
    phone: "",
    email: "",
  });

  const [adminData, setAdminData] = useState<AdminData>({
    name: "",
    email: "",
    password: "",
  });

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens
      .trim();
  };

  const handleBarbershopChange = (
    field: keyof BarbershopData,
    value: string
  ) => {
    setBarbershopData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug when name changes
      if (field === "name") {
        updated.slug = generateSlug(value);
      }

      return updated;
    });
  };

  const handleAdminChange = (field: keyof AdminData, value: string) => {
    setAdminData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    return (
      barbershopData.name &&
      barbershopData.slug &&
      barbershopData.address &&
      barbershopData.phone &&
      barbershopData.email
    );
  };

  const validateStep2 = () => {
    return adminData.name && adminData.email && adminData.password.length >= 6;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    setError("");

    try {
      // Check if slug already exists
      const { data: existingSlug } = await supabase
        .from("barbershops")
        .select("slug")
        .eq("slug", barbershopData.slug)
        .single();

      if (existingSlug) {
        setError(
          "Esta URL já está em uso. Escolha outra URL para sua barbearia."
        );
        setLoading(false);
        return;
      }

      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from("barbershops")
        .select("email")
        .eq("email", barbershopData.email)
        .single();

      if (existingEmail) {
        setError(
          "Este email já está cadastrado. Use outro email para sua barbearia."
        );
        setLoading(false);
        return;
      }

      // 1. Create barbershop
      const { data: barbershop, error: barbershopError } = await supabase
        .from("barbershops")
        .insert([
          {
            name: barbershopData.name,
            slug: barbershopData.slug,
            address: barbershopData.address,
            phone: barbershopData.phone,
            email: barbershopData.email,
          },
        ])
        .select()
        .single();

      if (barbershopError) {
        if (barbershopError.code === "23505") {
          if (barbershopError.message.includes("slug")) {
            setError(
              "Esta URL já está em uso. Escolha outra URL para sua barbearia."
            );
          } else if (barbershopError.message.includes("email")) {
            setError(
              "Este email já está cadastrado. Use outro email para sua barbearia."
            );
          } else {
            setError(
              "Dados duplicados. Verifique se a barbearia já não está cadastrada."
            );
          }
        } else {
          setError("Erro ao criar barbearia. Tente novamente.");
        }
        setLoading(false);
        return;
      }

      // 2. Create admin user in Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          emailRedirectTo: window.location.origin + '/login',
          data: {
            name: adminData.name,
            barbershop_id: barbershop.id,
            role: "admin",
          },
        },
      });

      if (authError) {
        console.error('Erro ao criar usuário no Supabase Auth:', authError);
        throw authError;
      }

      if (!authUser.user) {
        throw new Error('Usuário não foi criado no Supabase Auth');
      }

      // 3. Create user record in users table
      const { error: userError } = await supabase.from("users").insert([
        {
          id: authUser.user?.id,
          email: adminData.email,
          name: adminData.name,
          barbershop_id: barbershop.id,
          role: "admin",
          work_hours: [
            { day: 1, start: "09:00", end: "18:00" },
            { day: 2, start: "09:00", end: "18:00" },
            { day: 3, start: "09:00", end: "18:00" },
            { day: 4, start: "09:00", end: "18:00" },
            { day: 5, start: "09:00", end: "20:00" },
            { day: 6, start: "08:00", end: "16:00" },
          ],
        },
      ]);

      if (userError) throw userError;

      // 4. Create default services
      const defaultServices = [
        { name: "Corte de Cabelo", price: 40.0, duration: 45 },
        { name: "Barba", price: 30.0, duration: 30 },
        { name: "Corte e Barba", price: 65.0, duration: 75 },
        { name: "Pezinho", price: 15.0, duration: 15 },
      ];

      const { error: servicesError } = await supabase.from("services").insert(
        defaultServices.map((service) => ({
          ...service,
          barbershop_id: barbershop.id,
        }))
      );

      if (servicesError) throw servicesError;

      // Success! Redirect to login
      navigate("/login", {
        state: {
          message: "Barbearia criada com sucesso! Faça login para começar.",
          email: adminData.email,
        },
      });
    } catch (err: any) {
      console.error("Erro no cadastro:", err);

      // Mensagens de erro mais específicas
      if (err.code === "23505") {
        if (err.message.includes("slug")) {
          setError("Esta URL já está em uso. Escolha outra URL para sua barbearia.");
        } else if (err.message.includes("email")) {
          setError("Este email já está cadastrado. Use outro email.");
        } else {
          setError("Dados duplicados. Verifique se a barbearia já não está cadastrada.");
        }
      } else if (err.message?.includes("User already registered")) {
        setError("Este email já possui cadastro. Faça login ou use outro email.");
      } else if (err.message?.includes("Email")) {
        setError("Erro no email: " + err.message);
      } else if (err.message?.includes("Password")) {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError(err.message || "Erro ao criar barbearia. Verifique os dados e tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationContainer>
      <RegistrationCard $variant="elevated">
        <CardHeader>
          <div>
            <Heading $level={2} $gradient>
              Cadastrar Barbearia
            </Heading>
            <Text $color="tertiary" style={{ marginTop: "0.5rem" }}>
              Crie sua conta e comece a gerenciar seus agendamentos
            </Text>
          </div>
        </CardHeader>

        <CardContent>
          {/* Step Indicator */}
          <StepContainer>
            <StepIndicator $active={currentStep >= 1}>1</StepIndicator>
            <StepLine $completed={currentStep > 1} />
            <StepIndicator $active={currentStep >= 2}>2</StepIndicator>
          </StepContainer>

          {error && (
            <div
              style={{
                padding: "1rem",
                background: "#fee2e2",
                color: "#dc2626",
                borderRadius: "0.5rem",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Step 1: Barbershop Info */}
          {currentStep === 1 && (
            <Flex $direction="column" $gap="1.5rem">
              <div>
                <Text
                  $weight="medium"
                  $color="primary"
                  style={{ marginBottom: "0.5rem" }}
                >
                  Informações da Barbearia
                </Text>

                <Flex $direction="column" $gap="1rem">
                  <InputField
                    label="Nome da Barbearia"
                    placeholder="Ex: Navalha Dourada"
                    autoComplete="organization"
                    value={barbershopData.name}
                    onChange={(e) =>
                      handleBarbershopChange("name", e.target.value)
                    }
                    required
                  />

                  <InputField
                    label="URL da Barbearia"
                    placeholder="navalha-dourada"
                    value={barbershopData.slug}
                    onChange={(e) =>
                      handleBarbershopChange("slug", e.target.value)
                    }
                    helperText="Esta será sua URL: barberflow.com/navalha-dourada"
                    required
                  />

                  <InputField
                    label="Endereço Completo"
                    placeholder="Rua das Tesouras, 123 - Centro"
                    autoComplete="street-address"
                    value={barbershopData.address}
                    onChange={(e) =>
                      handleBarbershopChange("address", e.target.value)
                    }
                    required
                  />

                  <InputField
                    label="Telefone"
                    placeholder="(11) 99999-9999"
                    type="tel"
                    autoComplete="tel"
                    value={barbershopData.phone}
                    onChange={(e) =>
                      handleBarbershopChange("phone", e.target.value)
                    }
                    required
                  />

                  <InputField
                    label="Email da Barbearia"
                    type="email"
                    autoComplete="email"
                    placeholder="contato@navalhadourada.com"
                    value={barbershopData.email}
                    onChange={(e) =>
                      handleBarbershopChange("email", e.target.value)
                    }
                    required
                  />
                </Flex>
              </div>

              <Flex $justify="between" $gap="1rem">
                <Button $variant="ghost" onClick={() => navigate("/login")}>
                  Voltar ao Login
                </Button>
                <Button onClick={handleNextStep} disabled={!validateStep1()}>
                  Próximo Passo
                </Button>
              </Flex>
            </Flex>
          )}

          {/* Step 2: Admin Info */}
          {currentStep === 2 && (
            <Flex $direction="column" $gap="1.5rem">
              <div>
                <Text
                  $weight="medium"
                  $color="primary"
                  style={{ marginBottom: "0.5rem" }}
                >
                  Dados do Administrador
                </Text>

                <Flex $direction="column" $gap="1rem">
                  <InputField
                    label="Nome Completo"
                    placeholder="João Silva"
                    autoComplete="name"
                    value={adminData.name}
                    onChange={(e) => handleAdminChange("name", e.target.value)}
                    required
                  />

                  <InputField
                    label="Email de Login"
                    type="email"
                    autoComplete="email"
                    placeholder="joao@navalhadourada.com"
                    value={adminData.email}
                    onChange={(e) => handleAdminChange("email", e.target.value)}
                    helperText="Este será seu email para fazer login no sistema"
                    required
                  />

                  <InputField
                    label="Senha"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Mínimo 6 caracteres"
                    value={adminData.password}
                    onChange={(e) =>
                      handleAdminChange("password", e.target.value)
                    }
                    helperText="Escolha uma senha segura"
                    required
                  />
                </Flex>
              </div>

              <Flex $justify="between" $gap="1rem">
                <Button $variant="ghost" onClick={handlePrevStep}>
                  Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!validateStep2() || loading}
                  $loading={loading}
                >
                  {loading ? "Criando..." : "Criar Barbearia"}
                </Button>
              </Flex>
            </Flex>
          )}
        </CardContent>
      </RegistrationCard>
    </RegistrationContainer>
  );
};

export default BarbershopRegistrationPage;
