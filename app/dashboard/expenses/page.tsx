import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function ExpensesPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const expenses = await db.expense.findMany({
    where: { businessId: user.businessId },
    include: {
      paymentAccount: true,
    },
    orderBy: { date: 'desc' },
    take: 50,
  })

  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Track your business expenses</p>
        </div>
        <Link href="/dashboard/expenses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
          <CardDescription>This period</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{expense.category}</CardTitle>
                  <CardDescription>{expense.description}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-destructive">
                    {formatCurrency(Number(expense.amount))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(expense.date)}
                  </p>
                </div>
              </div>
            </CardHeader>
            {expense.paymentAccount && (
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Paid from: {expense.paymentAccount.name}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {expenses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No expenses recorded</p>
            <Link href="/dashboard/expenses/new">
              <Button>Add Your First Expense</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

