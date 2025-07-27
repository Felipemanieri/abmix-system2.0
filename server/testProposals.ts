// SCRIPT PARA CRIAR PROPOSTAS DE TESTE
// Para validar o sistema de criação automática de subpastas

import { storage } from "./storage";
import { googleDriveService } from "./googleDriveService";

export async function createTestProposals() {
  console.log("🚀 Criando propostas de teste para validação do sistema...");

  // VENDEDORES DE TESTE ESPECÍFICOS
  const testVendors = [
    { id: 1, name: "Ana Caroline Terto", email: "comercial14@abmix.com.br" },
    { id: 2, name: "Fabiana Godinho", email: "comercial@abmix.com.br" },
    { id: 3, name: "Bruna Garcia", email: "comercial10@abmix.com.br" }
  ];

  // PROPOSTAS DE TESTE
  const testProposals = [
    {
      vendorId: 1,
      contractData: {
        empresa: "Tech Solutions Brasil Ltda",
        cnpj: "12.345.678/0001-90",
        plano: "Empresarial Premium",
        valor: "R$ 8.500,00",
        odontoConjugado: true,
        livreAdesao: true,
        compulsorio: false,
        inicioVigencia: "2025-02-01"
      },
      titulares: [
        {
          nome: "Carlos Eduardo Silva",
          cpf: "123.456.789-10",
          email: "carlos@techsolutions.com.br",
          telefone: "(11) 9999-1234"
        }
      ],
      dependentes: [
        {
          nome: "Maria Silva Santos",
          cpf: "987.654.321-00",
          parentesco: "Cônjuge"
        }
      ],
      internalData: {
        reuniao: true,
        nomeReuniao: "Reunião inicial - Tech Solutions",
        origemVenda: "Indicação cliente"
      }
    },
    {
      vendorId: 2,
      contractData: {
        empresa: "Inovação Digital Corp",
        cnpj: "98.765.432/0001-12",
        plano: "Executivo Plus",
        valor: "R$ 12.800,00",
        odontoConjugado: true,
        livreAdesao: false,
        compulsorio: true,
        inicioVigencia: "2025-02-15"
      },
      titulares: [
        {
          nome: "Roberto Fernandes Lima",
          cpf: "456.789.123-45",
          email: "roberto@inovacaodigital.com.br",
          telefone: "(11) 8888-5678"
        },
        {
          nome: "Ana Paula Costa",
          cpf: "789.123.456-78",
          email: "ana.costa@inovacaodigital.com.br",
          telefone: "(11) 7777-9012"
        }
      ],
      dependentes: [
        {
          nome: "Lucas Fernandes Costa",
          cpf: "321.654.987-99",
          parentesco: "Filho"
        },
        {
          nome: "Beatriz Costa Lima",
          cpf: "654.987.321-88",
          parentesco: "Filha"
        }
      ],
      internalData: {
        reuniao: true,
        nomeReuniao: "Apresentação comercial - Inovação Digital",
        vendaDupla: true,
        nomeVendaDupla: "Ana Caroline Terto",
        origemVenda: "Prospecção ativa"
      }
    },
    {
      vendorId: 3,
      contractData: {
        empresa: "Consultoria Estratégica Empresarial",
        cnpj: "11.222.333/0001-44",
        plano: "Empresarial Standard",
        valor: "R$ 6.200,00",
        odontoConjugado: false,
        livreAdesao: true,
        compulsorio: false,
        inicioVigencia: "2025-03-01"
      },
      titulares: [
        {
          nome: "Patricia Oliveira Santos",
          cpf: "147.258.369-00",
          email: "patricia@consultoriaestrategica.com.br",
          telefone: "(11) 6666-3456"
        }
      ],
      dependentes: [
        {
          nome: "João Pedro Santos",
          cpf: "258.369.147-11",
          parentesco: "Filho"
        },
        {
          nome: "Isabella Santos Oliveira",
          cpf: "369.147.258-22",
          parentesco: "Filha"
        },
        {
          nome: "Gabriel Santos Costa",
          cpf: "741.852.963-33",
          parentesco: "Filho"
        }
      ],
      internalData: {
        reuniao: true,
        nomeReuniao: "Reunião de fechamento - Consultoria",
        desconto: "5%",
        autorizadorDesconto: "Michelle Manieri",
        origemVenda: "Referência"
      }
    }
  ];

  const createdProposals = [];

  for (let i = 0; i < testProposals.length; i++) {
    const testData = testProposals[i];
    const vendor = testVendors.find(v => v.id === testData.vendorId);
    
    try {
      // GERAR IDs ÚNICOS
      const proposalCount = await storage.getProposalCount();
      const abmId = `ABM${String(proposalCount + i + 1).padStart(3, '0')}`;
      const proposalId = `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const clientToken = `CLIENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // CRIAR SUBPASTA AUTOMATICAMENTE NO GOOGLE DRIVE
      const companyName = testData.contractData.empresa;
      const driveFolder = await googleDriveService.createClientFolder(companyName);

      const proposalToInsert = {
        id: proposalId,
        abmId: abmId,
        vendorId: testData.vendorId,
        clientToken: clientToken,
        contractData: testData.contractData,
        titulares: testData.titulares,
        dependentes: testData.dependentes,
        internalData: testData.internalData,
        vendorAttachments: [],
        clientAttachments: [],
        clientCompleted: false,
        status: "observacao",
        // CAMPOS GOOGLE DRIVE
        driveFolder: driveFolder.link,
        folderName: companyName,
        driveFolderId: driveFolder.id
      };

      const createdProposal = await storage.createProposal(proposalToInsert);
      createdProposals.push(createdProposal);

      console.log(`✅ Proposta criada: ${abmId} - ${companyName} (${vendor?.name})`);
      console.log(`   📁 Pasta criada: ${driveFolder.link}`);
      console.log(`   🔗 Link cliente: /cliente/proposta/${clientToken}`);

    } catch (error) {
      console.error(`❌ Erro ao criar proposta para ${vendor?.name}:`, error);
    }
  }

  console.log(`\n🎉 ${createdProposals.length} propostas de teste criadas com sucesso!`);
  
  return {
    success: true,
    proposalsCreated: createdProposals.length,
    proposals: createdProposals.map(p => ({
      id: p.abmId,
      empresa: p.contractData.empresa || p.contractData.nomeEmpresa,
      vendedor: testVendors.find(v => v.id === p.vendorId)?.name,
      driveFolder: p.driveFolder,
      clientLink: `/cliente/proposta/${p.clientToken}`
    }))
  };
}

// FUNÇÃO PARA LIMPAR PROPOSTAS DE TESTE (SE NECESSÁRIO)
export async function clearTestProposals() {
  console.log("🧹 Limpando propostas de teste...");
  
  try {
    await storage.clearAllProposals();
    console.log("✅ Todas as propostas foram removidas");
    return { success: true, message: "Propostas de teste removidas" };
  } catch (error) {
    console.error("❌ Erro ao limpar propostas:", error);
    return { success: false, error: "Erro ao limpar propostas" };
  }
}