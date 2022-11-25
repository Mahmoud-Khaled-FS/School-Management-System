const schoolLevels = {
  primarySchool: {
    id: 'primary',
    englishName: 'Primary School',
    name: 'المرحلة الابتدائية',
    years: [1, 2, 3, 4, 5, 6],
  },
  preparatorySchool: {
    id: 'preparatory',
    englishName: 'Preparatory School',
    name: 'المرحلة الاعدادية',
    years: [7, 8, 9],
  },
  secondarySchool: {
    id: 'secondary',
    englishName: 'Secondary School',
    name: 'المرحلة الثانوية',
    years: [10, 11, 12],
  },
};

export const getSchoolLevelData = (year: number) => {
  if (schoolLevels.primarySchool.years.includes(year))
    return { name: schoolLevels.primarySchool.name, englishName: schoolLevels.primarySchool.englishName, year };
  if (schoolLevels.preparatorySchool.years.includes(year))
    return { name: schoolLevels.preparatorySchool.name, englishName: schoolLevels.preparatorySchool.englishName, year };
  if (schoolLevels.secondarySchool.years.includes(year))
    return { name: schoolLevels.secondarySchool.name, englishName: schoolLevels.secondarySchool.englishName, year };
  return null;
};

export default schoolLevels;
