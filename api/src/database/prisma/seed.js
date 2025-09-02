const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CREATE_NOTIFICATION = {
  stepKey: 'CREATE_NOTIFICATION',
  title: 'Create Notification',
  fields: [
    {
      id: 'title',
      label: 'Título',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 120,
    },
    {
      id: 'description',
      label: 'Descrição',
      type: 'textarea',
      required: true,
      minLength: 10,
      maxLength: 1000,
    },
    {
      id: 'hearingDate',
      label: 'Data da Audiência',
      type: 'date',
      required: true,
      format: 'date',
    },
  ],
};

const CREATE_NOTIFIED_PERSON = {
  stepKey: 'CREATE_NOTIFIED_PERSON',
  title: 'Create Notified Person',
  fields: [
    { id: 'name', label: 'Nome', type: 'text', required: true, minLength: 3 },
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      format: 'email',
    },
    { id: 'phone', label: 'Telefone', type: 'text', required: true },
    { id: 'cep', label: 'CEP', type: 'text', required: true },
    { id: 'state', label: 'Estado', type: 'text', required: true },
    { id: 'city', label: 'Cidade', type: 'text', required: true },
    { id: 'neighborhood', label: 'Bairro', type: 'text', required: true },
    { id: 'street', label: 'Rua', type: 'text', required: true },
  ],
};

async function upsertActiveForm(stepKey, schemaJson) {
  const active = await prisma.formSchema.findFirst({
    where: { stepKey, isActive: true },
  });

  if (active) {
    await prisma.formSchema.update({
      where: { id: active.id },
      data: { schemaJson },
    });
    return;
  }

  await prisma.formSchema.updateMany({
    where: { stepKey },
    data: { isActive: false },
  });

  const latest = await prisma.formSchema.findFirst({
    where: { stepKey },
    orderBy: { version: 'desc' },
  });
  const nextVersion = latest ? latest.version + 1 : 1;

  await prisma.formSchema.create({
    data: {
      stepKey,
      version: nextVersion,
      isActive: true,
      schemaJson,
    },
  });
}

async function upsertNotifierUser() {
  const email = 'notifier@lawgic.com';

  await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Lawgic Notifier',
      isActive: true,
      role: 'notifier',
      password: '$2b$10$/qXSt2NS7BSn89nepcSDSeJ/dEHU3RV1Ie7alR9FMTuy7IL2pKy5O',
    },
    create: {
      name: 'Lawgic Notifier',
      email,
      isActive: true,
      deletedAt: null,
      role: 'notifier',
      password: '$2b$10$/qXSt2NS7BSn89nepcSDSeJ/dEHU3RV1Ie7alR9FMTuy7IL2pKy5O',
    },
  });
}

async function upsertReviewerUser() {
  const email = 'reviewer@lawgic.com';

  await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Lawgic Reviewer',
      isActive: true,
      role: 'reviewer',
      password: '$2b$10$yzivOZ76vuUjEyTN2zaTFu.4Oy0evpEHzjkJNIXfrQgsdASeKD34a',
    },
    create: {
      name: 'Lawgic Reviewer',
      email,
      isActive: true,
      deletedAt: null,
      role: 'reviewer',
      password: '$2b$10$yzivOZ76vuUjEyTN2zaTFu.4Oy0evpEHzjkJNIXfrQgsdASeKD34a',
    },
  });
}

async function main() {
  await upsertActiveForm('CREATE_NOTIFICATION', CREATE_NOTIFICATION);
  await upsertActiveForm('CREATE_NOTIFIED_PERSON', CREATE_NOTIFIED_PERSON);
  await upsertNotifierUser();
  await upsertReviewerUser();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
