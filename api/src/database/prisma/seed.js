const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CREATE_NOTIFICATION = {
  stepKey: 'CREATE_NOTIFICATION',
  title: 'Create Notification',
  fields: [
    {
      id: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 120,
    },
    {
      id: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      minLength: 10,
      maxLength: 1000,
    },
    {
      id: 'hearingDate',
      label: 'Hearing Date',
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
    { id: 'name', label: 'Name', type: 'text', required: true, minLength: 3 },
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      format: 'email',
    },
    { id: 'phone', label: 'Phone', type: 'text', required: true },
    { id: 'cep', label: 'CEP', type: 'text', required: true },
    { id: 'state', label: 'State', type: 'text', required: true },
    { id: 'city', label: 'City', type: 'text', required: true },
    { id: 'neighborhood', label: 'Neighborhood', type: 'text', required: true },
    { id: 'street', label: 'Street', type: 'text', required: true },
  ],
};

const VALIDATE_NOTIFICATION = {
  stepKey: 'VALIDATE_NOTIFICATION',
  title: 'Validate Notification',
  fields: [
    {
      id: 'needsAdditionalInfo',
      label: 'Needs additional info?',
      type: 'radio',
      required: true,
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
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
    console.log(`Updated active form for step ${stepKey}`);
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

  console.log(`Created form v${nextVersion} for step ${stepKey}`);
}

async function main() {
  await upsertActiveForm('CREATE_NOTIFICATION', CREATE_NOTIFICATION);
  await upsertActiveForm('CREATE_NOTIFIED_PERSON', CREATE_NOTIFIED_PERSON);
  await upsertActiveForm('VALIDATE_NOTIFICATION', VALIDATE_NOTIFICATION);
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
