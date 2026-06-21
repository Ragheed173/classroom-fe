import { BaseRecord, DataProvider, GetListParams, GetListResponse } from "@refinedev/core";
import { MOCK_SUBJECTS } from "@/mocks/subjects";
export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({resource}:
    GetListParams) : Promise<GetListResponse<TData>> => {
      if (resource !== 'subjects') return { data: [] as TData[], total: 0 };

      return { data: MOCK_SUBJECTS as unknown as TData[], total: MOCK_SUBJECTS.length };
    },
    getOne: async ()=> {throw new Error('This function is not present in the data mock')},
    create: async ()=> {throw new Error('This function is not present in the data mock')},
    update: async ()=> {throw new Error('This function is not present in the data mock')},
    deleteOne: async ()=> {throw new Error('This function is not present in the data mock')},
    getApiUrl:  ()=> '',
  };
