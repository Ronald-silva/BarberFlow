// Serviço de Pagamento - PIX + Bitcoin
import { supabase } from './supabase';

export interface PaymentData {
  appointmentId: string;
  amount: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
}

export interface PaymentResponse {
  paymentId: string;
  paymentUrl?: string;
  qrCode?: string;
  pixCode?: string;
  bitcoinAddress?: string;
  bitcoinAmount?: number;
  bitcoinQrCode?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiresAt?: string;
}

export type PaymentMethod = 'pix' | 'bitcoin' | 'credit_card' | 'debit_card';

class PaymentService {
  private pixKey: string;
  private bitcoinAddress: string;
  private bitcoinApiKey: string;

  constructor() {
    this.pixKey = process.env.REACT_APP_PIX_KEY || '';
    this.bitcoinAddress = process.env.REACT_APP_BITCOIN_ADDRESS || '';
    this.bitcoinApiKey = process.env.REACT_APP_BLOCKCHAIN_API_KEY || '';
  }

  // Criar pagamento PIX
  async createPixPayment(data: PaymentData): Promise<PaymentResponse> {
    try {
      const paymentId = `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

      // Gerar código PIX
      const pixCode = this.generatePixCode({
        key: this.pixKey,
        amount: data.amount,
        description: data.description,
        txid: paymentId
      });

      // Gerar QR Code do PIX
      const qrCode = await this.generateQRCode(pixCode);

      // Salvar pagamento no banco
      await this.savePaymentRecord(paymentId, data.appointmentId, 'pending', 'pix', {
        pixCode,
        amount: data.amount,
        expiresAt: expiresAt.toISOString()
      });

      return {
        paymentId,
        pixCode,
        qrCode,
        status: 'pending',
        expiresAt: expiresAt.toISOString()
      };
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw new Error('Falha ao processar pagamento PIX');
    }
  }

  // Gerar código PIX (BR Code)
  private generatePixCode(data: {
    key: string;
    amount: number;
    description: string;
    txid: string;
  }): string {
    // Implementação simplificada do BR Code (PIX)
    // Em produção, use uma biblioteca específica como 'pix-utils'
    
    const merchantName = 'BARBEARIA'; // Nome do estabelecimento
    const merchantCity = 'SAO PAULO'; // Cidade
    
    // Formato básico do PIX (simplificado)
    const pixString = [
      '00020126', // Payload Format Indicator
      '580014BR.GOV.BCB.PIX', // Merchant Account Information
      `0114${data.key}`, // PIX Key
      '5204000', // Merchant Category Code
      '5303986', // Transaction Currency (BRL)
      `54${data.amount.toFixed(2).padStart(2, '0')}`, // Transaction Amount
      '5802BR', // Country Code
      `59${merchantName.length.toString().padStart(2, '0')}${merchantName}`, // Merchant Name
      `60${merchantCity.length.toString().padStart(2, '0')}${merchantCity}`, // Merchant City
      `62${data.txid.length.toString().padStart(2, '0')}${data.txid}`, // Additional Data Field
      '6304' // CRC16
    ].join('');

    // Calcular CRC16 (simplificado - em produção use biblioteca específica)
    const crc = this.calculateCRC16(pixString);
    
    return pixString + crc.toString(16).toUpperCase().padStart(4, '0');
  }

  // Calcular CRC16 (implementação simplificada)
  private calculateCRC16(data: string): number {
    // Implementação básica - em produção use biblioteca específica
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc;
  }

  // Criar pagamento Bitcoin
  async createBitcoinPayment(data: PaymentData): Promise<PaymentResponse> {
    try {
      const paymentId = `btc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora para Bitcoin

      // Obter cotação atual do Bitcoin
      const btcPrice = await this.getBitcoinPrice();
      const bitcoinAmount = data.amount / btcPrice;

      // Gerar endereço único (em produção, use HD Wallet)
      const bitcoinAddress = await this.generateBitcoinAddress();

      // Gerar QR Code do Bitcoin
      const bitcoinUri = `bitcoin:${bitcoinAddress}?amount=${bitcoinAmount.toFixed(8)}&label=${encodeURIComponent(data.description)}`;
      const bitcoinQrCode = await this.generateQRCode(bitcoinUri);

      // Salvar pagamento no banco
      await this.savePaymentRecord(paymentId, data.appointmentId, 'pending', 'bitcoin', {
        bitcoinAddress,
        bitcoinAmount,
        btcPrice,
        amount: data.amount,
        expiresAt: expiresAt.toISOString()
      });

      // Iniciar monitoramento da transação
      this.monitorBitcoinPayment(paymentId, bitcoinAddress, bitcoinAmount);

      return {
        paymentId,
        bitcoinAddress,
        bitcoinAmount,
        bitcoinQrCode,
        status: 'pending',
        expiresAt: expiresAt.toISOString()
      };
    } catch (error) {
      console.error('Erro ao criar pagamento Bitcoin:', error);
      throw new Error('Falha ao processar pagamento Bitcoin');
    }
  }

  // Obter preço atual do Bitcoin em BRL
  private async getBitcoinPrice(): Promise<number> {
    try {
      const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice/BRL.json');
      const data = await response.json();
      return parseFloat(data.bpi.BRL.rate.replace(/,/g, ''));
    } catch (error) {
      console.error('Erro ao obter preço Bitcoin:', error);
      // Fallback para preço estimado
      return 300000; // R$ 300.000 (ajustar conforme necessário)
    }
  }

  // Gerar endereço Bitcoin único
  private async generateBitcoinAddress(): Promise<string> {
    // Em produção, use HD Wallet para gerar endereços únicos
    // Por enquanto, retorna o endereço configurado
    return this.bitcoinAddress;
  }

  // Monitorar pagamento Bitcoin
  private async monitorBitcoinPayment(paymentId: string, address: string, expectedAmount: number) {
    // Verificar a cada 30 segundos por 1 hora
    const checkInterval = setInterval(async () => {
      try {
        const received = await this.checkBitcoinBalance(address);
        
        if (received >= expectedAmount) {
          // Pagamento confirmado
          await this.updatePaymentStatus(paymentId, 'approved');
          clearInterval(checkInterval);
        }
      } catch (error) {
        console.error('Erro ao verificar Bitcoin:', error);
      }
    }, 30000);

    // Parar monitoramento após 1 hora
    setTimeout(() => {
      clearInterval(checkInterval);
      this.updatePaymentStatus(paymentId, 'expired');
    }, 60 * 60 * 1000);
  }

  // Verificar saldo Bitcoin
  private async checkBitcoinBalance(address: string): Promise<number> {
    try {
      const response = await fetch(`https://blockstream.info/api/address/${address}`);
      const data = await response.json();
      return data.chain_stats.funded_txo_sum / 100000000; // Converter satoshis para BTC
    } catch (error) {
      console.error('Erro ao verificar saldo Bitcoin:', error);
      return 0;
    }
  }

  // Gerar QR Code
  private async generateQRCode(text: string): Promise<string> {
    try {
      // Usar API pública para gerar QR Code
      const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`);
      return response.url;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return '';
    }
  }

  // Verificar status do pagamento
  async checkPaymentStatus(paymentId: string): Promise<string> {
    try {
      const { data: payment } = await supabase
        .from('payments')
        .select('status, payment_method, payment_data')
        .eq('payment_id', paymentId)
        .single();

      if (!payment) return 'not_found';

      // Se for PIX, verificar manualmente ou via webhook
      if (payment.payment_method === 'pix') {
        // Em produção, implementar verificação via API bancária
        return payment.status;
      }

      // Se for Bitcoin, verificar blockchain
      if (payment.payment_method === 'bitcoin') {
        const paymentData = payment.payment_data as any;
        const received = await this.checkBitcoinBalance(paymentData.bitcoinAddress);
        
        if (received >= paymentData.bitcoinAmount && payment.status === 'pending') {
          await this.updatePaymentStatus(paymentId, 'approved');
          return 'approved';
        }
      }

      return payment.status;
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      return 'error';
    }
  }

  // Salvar registro do pagamento
  private async savePaymentRecord(
    paymentId: string, 
    appointmentId: string, 
    status: string, 
    method: PaymentMethod,
    paymentData: any
  ) {
    await supabase
      .from('payments')
      .insert({
        payment_id: paymentId,
        appointment_id: appointmentId,
        amount: paymentData.amount,
        status: status,
        payment_method: method,
        payment_data: paymentData,
        created_at: new Date().toISOString()
      });
  }

  // Atualizar status do pagamento
  async updatePaymentStatus(paymentId: string, status: string) {
    try {
      // Atualizar na tabela payments
      await supabase
        .from('payments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('payment_id', paymentId);

      // Se aprovado, confirmar agendamento
      if (status === 'approved') {
        const { data: payment } = await supabase
          .from('payments')
          .select('appointment_id, amount')
          .eq('payment_id', paymentId)
          .single();

        if (payment) {
          await supabase
            .from('appointments')
            .update({ 
              status: 'confirmed',
              payment_status: 'paid',
              total_amount: payment.amount
            })
            .eq('id', payment.appointment_id);

          // Enviar notificação de pagamento confirmado
          // (implementar integração com notificationService)
        }
      }

      // Se expirado, cancelar agendamento
      if (status === 'expired') {
        const { data: payment } = await supabase
          .from('payments')
          .select('appointment_id')
          .eq('payment_id', paymentId)
          .single();

        if (payment) {
          await supabase
            .from('appointments')
            .update({ 
              status: 'cancelled',
              payment_status: 'expired'
            })
            .eq('id', payment.appointment_id);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
    }
  }

  // Método público para criar pagamento (escolhe PIX ou Bitcoin)
  async createPayment(data: PaymentData, method: PaymentMethod): Promise<PaymentResponse> {
    switch (method) {
      case 'pix':
        return this.createPixPayment(data);
      case 'bitcoin':
        return this.createBitcoinPayment(data);
      default:
        throw new Error(`Método de pagamento ${method} não implementado ainda`);
    }
  }
}

export const paymentService = new PaymentService();