import React, { useState, useMemo } from "react";
import {
  Users,
  User,
  Briefcase,
  GraduationCap,
  Info,
  Calendar,
  TrendingUp,
  Baby,
} from "lucide-react";

interface Parent {
  id: number;
  name: string;
  type: "employed" | "student";
  monthlySalary: number;
  employerTopUp: number;
  daysToTake: number;
  daysPerWeek: number;
  startDate: string;
  endDate: string;
}

const ForaldrapengenCalculator = () => {
  const [numParents, setNumParents] = useState<1 | 2>(2);
  const [birthDate, setBirthDate] = useState<string>("2025-03-01");
  const [doubleDays, setDoubleDays] = useState<number>(30);
  const [parents, setParents] = useState<Parent[]>([
    {
      id: 1,
      name: "Förälder 1",
      type: "employed",
      monthlySalary: 35000,
      employerTopUp: 10,
      daysToTake: 240,
      daysPerWeek: 5,
      startDate: "2025-03-01",
      endDate: "2026-01-15",
    },
    {
      id: 2,
      name: "Förälder 2",
      type: "employed",
      monthlySalary: 35000,
      employerTopUp: 10,
      daysToTake: 240,
      daysPerWeek: 5,
      startDate: "2026-01-16",
      endDate: "2026-11-30",
    },
  ]);

  const [showInfo, setShowInfo] = useState<boolean>(false);

  const calculateSGI = (monthlySalary: number): number => {
    const yearlyIncome = monthlySalary * 12;
    return yearlyIncome * 0.97;
  };

  const calculateDailyBenefit = (sgi: number): number => {
    const daily = (sgi * 0.8) / 365;
    return Math.min(Math.max(daily, 250), 1250);
  };

  const calculateTax = (
    dailyBenefit: number,
    hasEmployerIncome: boolean
  ): number => {
    const taxRate = hasEmployerIncome ? 0.3 : 0.25;
    return dailyBenefit * taxRate;
  };

  const getDaysBetweenDates = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateParentBenefits = (parent: Parent) => {
    const sgi = calculateSGI(parent.monthlySalary);
    const dailyBenefit = calculateDailyBenefit(sgi);

    const reservedDays = 90;
    const transferableDays = Math.max(0, parent.daysToTake - reservedDays);

    const highLevelDays = Math.min(parent.daysToTake, 390);
    const lowLevelDays = Math.max(0, parent.daysToTake - 390);

    const fkBenefitBeforeTax =
      highLevelDays * dailyBenefit + lowLevelDays * 180;

    const tax = calculateTax(dailyBenefit, parent.type === "employed");
    const fkBenefitAfterTax =
      highLevelDays * (dailyBenefit - tax) + lowLevelDays * (180 - 180 * 0.25);

    const employerTopUpAmount =
      parent.type === "employed"
        ? (highLevelDays * dailyBenefit * parent.employerTopUp) / 100
        : 0;

    const totalBenefitBeforeTax = fkBenefitBeforeTax + employerTopUpAmount;
    const totalBenefitAfterTax = fkBenefitAfterTax + employerTopUpAmount;

    const totalDays = getDaysBetweenDates(parent.startDate, parent.endDate);
    const weeksNeeded = Math.ceil(totalDays / 7);

    const avgDailyBenefit =
      parent.daysToTake > 0 ? totalBenefitAfterTax / parent.daysToTake : 0;

    return {
      sgi,
      dailyBenefit,
      dailyBenefitAfterTax: dailyBenefit - tax,
      highLevelDays,
      lowLevelDays,
      reservedDays,
      transferableDays,
      fkBenefitBeforeTax,
      fkBenefitAfterTax,
      employerTopUpAmount,
      totalBenefitBeforeTax,
      totalBenefitAfterTax,
      weeksNeeded,
      monthsNeeded: weeksNeeded / 4.33,
      avgDailyBenefit,
      tax,
    };
  };

  const updateParent = (id: number, field: keyof Parent, value: any) => {
    setParents((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };

          if (
            field === "startDate" &&
            updated.daysToTake &&
            updated.daysPerWeek
          ) {
            const weeksNeeded = Math.ceil(
              updated.daysToTake / updated.daysPerWeek
            );
            const start = new Date(value);
            start.setDate(start.getDate() + weeksNeeded * 7);
            updated.endDate = start.toISOString().split("T")[0];
          }

          if (field === "daysToTake" || field === "daysPerWeek") {
            const weeksNeeded = Math.ceil(
              updated.daysToTake / updated.daysPerWeek
            );
            const start = new Date(updated.startDate);
            start.setDate(start.getDate() + weeksNeeded * 7);
            updated.endDate = start.toISOString().split("T")[0];
          }

          return updated;
        }
        return p;
      })
    );
  };

  const totalDaysTaken = useMemo(() => {
    const individualDays = parents
      .slice(0, numParents)
      .reduce((sum, p) => sum + p.daysToTake, 0);
    return individualDays - doubleDays;
  }, [parents, numParents, doubleDays]);

  const daysRemaining = 480 - totalDaysTaken;

  const parentResults = useMemo(() => {
    return parents.slice(0, numParents).map((p) => calculateParentBenefits(p));
  }, [parents, numParents]);

  const totalBenefitBeforeTax = parentResults.reduce(
    (sum, r) => sum + r.totalBenefitBeforeTax,
    0
  );
  const totalBenefitAfterTax = parentResults.reduce(
    (sum, r) => sum + r.totalBenefitAfterTax,
    0
  );

  const getMonthlyData = useMemo(() => {
    const birth = new Date(birthDate);
    const monthlyData: any[] = [];

    const allDates = parents
      .slice(0, numParents)
      .flatMap((p) => [new Date(p.startDate), new Date(p.endDate)]);

    const minDate = new Date(
      Math.min(birth.getTime(), ...allDates.map((d) => d.getTime()))
    );
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

    let currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const endDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1);

    while (currentDate < endDate && monthlyData.length < 36) {
      const monthStart = new Date(currentDate);
      const monthEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const monthData = {
        month: currentDate.toLocaleDateString("sv-SE", {
          year: "numeric",
          month: "short",
        }),
        parent1Total: 0,
        parent2Total: 0,
        parent1Days: 0,
        parent2Days: 0,
      };

      parents.slice(0, numParents).forEach((p, idx) => {
        const parentStart = new Date(p.startDate);
        const parentEnd = new Date(p.endDate);
        const result = parentResults[idx];

        const isOnLeave = parentStart <= monthEnd && parentEnd >= monthStart;

        if (isOnLeave) {
          const overlapStart = new Date(
            Math.max(monthStart.getTime(), parentStart.getTime())
          );
          const overlapEnd = new Date(
            Math.min(monthEnd.getTime(), parentEnd.getTime())
          );
          const daysInMonth = Math.ceil(
            (overlapEnd.getTime() - overlapStart.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const workingDaysInMonth = Math.min(
            daysInMonth,
            p.daysPerWeek * 4.33
          );

          const benefitThisMonth = result.avgDailyBenefit * workingDaysInMonth;

          if (idx === 0) {
            monthData.parent1Total = Math.round(benefitThisMonth);
            monthData.parent1Days = Math.round(workingDaysInMonth);
          } else {
            monthData.parent2Total = Math.round(benefitThisMonth);
            monthData.parent2Days = Math.round(workingDaysInMonth);
          }
        } else {
          const monthlySalaryAfterTax = Math.round(p.monthlySalary * 0.7);

          if (idx === 0) {
            monthData.parent1Total = monthlySalaryAfterTax;
          } else {
            monthData.parent2Total = monthlySalaryAfterTax;
          }
        }
      });

      monthlyData.push(monthData);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return monthlyData;
  }, [birthDate, parents, numParents, parentResults]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-2">
            Föräldrapengen
          </h1>
          <p className="text-gray-600 text-lg">
            Beräkna och planera din föräldraledighet smart
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 text-indigo-700 font-semibold hover:text-indigo-800"
          >
            <Info size={20} />
            {showInfo
              ? "Dölj information"
              : "Visa information om föräldrapenning"}
          </button>

          {showInfo && (
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <p>
                <strong>Totalt antal dagar:</strong> 480 dagar per barn kan
                delas mellan föräldrar
              </p>
              <p>
                <strong>Reserverade dagar:</strong> 90 dagar per förälder kan
                inte föras över till den andra föräldern
              </p>
              <p>
                <strong>Dubbeldagar:</strong> Under barnets första 15 månader
                kan båda föräldrarna vara hemma samtidigt i upp till 60
                dubbeldagar.
              </p>
              <p>
                <strong>Ersättningsnivåer:</strong> 390 dagar på 80% av SGI max
                1 250 kr per dag före skatt. 90 dagar på 180 kr per dag före
                skatt.
              </p>
              <p>
                <strong>Skatt:</strong> Föräldrapenning är skattepliktig. Cirka
                30% skatt dras om du har lön från arbetsgivare.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              <Baby className="inline mr-2" size={20} />
              När föds barnet?
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Antal föräldrar
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setNumParents(1)}
                className={`flex-1 py-3 px-6 rounded-lg border-2 transition-all ${
                  numParents === 1
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <User className="inline mr-2" size={20} />
                En förälder
              </button>
              <button
                onClick={() => setNumParents(2)}
                className={`flex-1 py-3 px-6 rounded-lg border-2 transition-all ${
                  numParents === 2
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Users className="inline mr-2" size={20} />
                Två föräldrar
              </button>
            </div>
          </div>

          {numParents === 2 && (
            <div className="mb-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Antal dubbeldagar båda föräldrar hemma samtidigt: {doubleDays}
              </label>
              <input
                type="range"
                value={doubleDays}
                onChange={(e) => setDoubleDays(Number(e.target.value))}
                className="w-full"
                min="0"
                max="60"
                step="5"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 dagar</span>
                <span>60 dagar</span>
              </div>
            </div>
          )}

          {parents.slice(0, numParents).map((parent, idx) => (
            <div key={parent.id} className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {parent.name}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anställningstyp
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateParent(parent.id, "type", "employed")}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm transition-all ${
                      parent.type === "employed"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Briefcase className="inline mr-1" size={16} />
                    Anställd
                  </button>
                  <button
                    onClick={() => updateParent(parent.id, "type", "student")}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm transition-all ${
                      parent.type === "student"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <GraduationCap className="inline mr-1" size={16} />
                    Student
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Månadslön före skatt kr
                </label>
                <input
                  type="number"
                  value={parent.monthlySalary}
                  onChange={(e) =>
                    updateParent(
                      parent.id,
                      "monthlySalary",
                      Number(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  min="0"
                  step="1000"
                />
              </div>

              {parent.type === "employed" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arbetsgivartillägg procent
                  </label>
                  <input
                    type="number"
                    value={parent.employerTopUp}
                    onChange={(e) =>
                      updateParent(
                        parent.id,
                        "employerTopUp",
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min="0"
                    max="100"
                    step="5"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Antal dagar att ta ut: {parent.daysToTake}
                </label>
                <input
                  type="range"
                  value={parent.daysToTake}
                  onChange={(e) =>
                    updateParent(
                      parent.id,
                      "daysToTake",
                      Number(e.target.value)
                    )
                  }
                  className="w-full"
                  min="0"
                  max="480"
                  step="10"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 dagar</span>
                  <span>480 dagar</span>
                </div>
                {parent.daysToTake > 390 && (
                  <p className="text-xs text-amber-600 mt-2">
                    Obs {parent.daysToTake - 390} dagar är lågersättningsdagar
                    180 kr per dag
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dagar per vecka: {parent.daysPerWeek}
                </label>
                <input
                  type="range"
                  value={parent.daysPerWeek}
                  onChange={(e) =>
                    updateParent(
                      parent.id,
                      "daysPerWeek",
                      Number(e.target.value)
                    )
                  }
                  className="w-full"
                  min="1"
                  max="7"
                  step="1"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 dag</span>
                  <span>7 dagar</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Startdatum för ledighet
                  </label>
                  <input
                    type="date"
                    value={parent.startDate}
                    onChange={(e) =>
                      updateParent(parent.id, "startDate", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slutdatum beräknat
                  </label>
                  <input
                    type="date"
                    value={parent.endDate}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-white rounded border border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">SGI</p>
                    <p className="font-semibold text-indigo-900">
                      {parentResults[idx]?.sgi.toLocaleString("sv-SE", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      kr/år
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dagersättning efter skatt</p>
                    <p className="font-semibold text-indigo-900">
                      {parentResults[idx]?.dailyBenefitAfterTax.toLocaleString(
                        "sv-SE",
                        { maximumFractionDigits: 0 }
                      )}{" "}
                      kr/dag
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ledighet</p>
                    <p className="font-semibold text-indigo-900">
                      {parentResults[idx]?.monthsNeeded.toFixed(1)} månader
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Högnivådagar</p>
                    <p className="font-semibold text-green-600">
                      {parentResults[idx]?.highLevelDays} dagar
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">
                      Total ersättning under ledighet efter skatt
                    </p>
                    <p className="font-semibold text-green-600 text-xl">
                      {parentResults[idx]?.totalBenefitAfterTax.toLocaleString(
                        "sv-SE",
                        { maximumFractionDigits: 0 }
                      )}{" "}
                      kr
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 p-6 bg-indigo-50 rounded-lg border-2 border-indigo-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-600">Totalt använda dagar</p>
                <p className="text-3xl font-bold text-indigo-900">
                  {totalDaysTaken} / 480
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Återstående dagar</p>
                <p
                  className={`text-3xl font-bold ${daysRemaining < 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {daysRemaining}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Månadsinkomst över tid Lön och Föräldrapenning efter skatt
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            När en förälder är ledig visas föräldrapenning. När en förälder
            jobbar visas normal lön cirka 70% efter skatt.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Månad</th>
                  <th className="text-right p-2">Förälder 1</th>
                  {numParents === 2 && (
                    <th className="text-right p-2">Förälder 2</th>
                  )}
                  <th className="text-right p-2">Totalt</th>
                </tr>
              </thead>
              <tbody>
                {getMonthlyData.map((data, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{data.month}</td>
                    <td className="text-right p-2">
                      {data.parent1Total.toLocaleString("sv-SE")} kr
                      {data.parent1Days > 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({Math.round(data.parent1Days)} dagar)
                        </span>
                      )}
                    </td>
                    {numParents === 2 && (
                      <td className="text-right p-2">
                        {data.parent2Total.toLocaleString("sv-SE")} kr
                        {data.parent2Days > 0 && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({Math.round(data.parent2Days)} dagar)
                          </span>
                        )}
                      </td>
                    )}
                    <td className="text-right p-2 font-semibold">
                      {(data.parent1Total + data.parent2Total).toLocaleString(
                        "sv-SE"
                      )}{" "}
                      kr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Sammanfattning
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-1">
                Total ersättning under ledighet efter skatt
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {totalBenefitAfterTax.toLocaleString("sv-SE", {
                  maximumFractionDigits: 0,
                })}{" "}
                kr
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Före skatt:{" "}
                {totalBenefitBeforeTax.toLocaleString("sv-SE", {
                  maximumFractionDigits: 0,
                })}{" "}
                kr
              </p>
            </div>

            {parents.slice(0, numParents).map((parent, idx) => (
              <div key={parent.id} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-800 mb-2">
                  {parent.name}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ledighet:</span>
                    <span className="font-medium">
                      {parentResults[idx]?.monthsNeeded.toFixed(1)} månader
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total ersättning:</span>
                    <span className="font-medium text-green-600">
                      {parentResults[idx]?.totalBenefitAfterTax.toLocaleString(
                        "sv-SE",
                        { maximumFractionDigits: 0 }
                      )}{" "}
                      kr
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Högnivådagar:</span>
                    <span className="font-medium">
                      {parentResults[idx]?.highLevelDays} av {parent.daysToTake}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 mt-8">
          <p>
            Beräkningarna är vägledande. Kontakta Försäkringskassan för exakta
            uppgifter.
          </p>
          <p className="mt-2">
            Data sparas inte och lämnar aldrig din webbläsare.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForaldrapengenCalculator;
