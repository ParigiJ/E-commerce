import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import db from "@/db/db";
import { formatNumber, formatCurrency } from "@/lib/formatters";

// function wait(duration: number) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, duration);
//   });
// }

async function getSalesData() {
  const data = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });
  // await wait(2000);

  return {
    amount: (data._sum.pricePaidInCents || 0) / 100,
    numberOfSales: data._count,
  };
}

async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    db.user.count(),
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
    }),
  ]);

  return {
    userCount,
    avgValPerUser:
      userCount === 0
        ? 0
        : (orderData._sum.pricePaidInCents || 0) / userCount / 100,
  };
}

async function getServiceData() {
  const [isActiveCount, inActiveCount] = await Promise.all([
    db.service.count({ where: { isAvailableForPurchase: true } }),
    db.service.count({ where: { isAvailableForPurchase: false } }),
  ]);
  return {
    isActiveCount,
    inActiveCount,
  };
}

export default async function AdminDashboard() {
  const [salesData, userData, serviceData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getServiceData(),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DashboardCard
        title="Services"
        subtitle={`${formatNumber(serviceData.isActiveCount)} Available`}
        body={`${formatNumber(serviceData.inActiveCount)} Unavailable`}
      />
      <DashboardCard
        title="Customers"
        subtitle={`${formatNumber(userData.userCount)} Users`}
        body={formatCurrency(userData.avgValPerUser)}
      />
      <DashboardCard
        title="Sales"
        subtitle={`${formatNumber(salesData.numberOfSales)} Orders`}
        body={formatCurrency(salesData.amount)}
      />
    </div>
  );
}

function DashboardCard({
  title,
  subtitle,
  body,
}: {
  title: string;
  subtitle: string;
  body: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}
