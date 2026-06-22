import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";
import { BACKEND_BASE_URL } from "@/constants";
import { ListResponse } from "@/types";

if (!BACKEND_BASE_URL) {
  throw new Error('BACKEND_BASE_URL is not set in the environment variables');
}

const options: CreateDataProviderOptions = {
  getList:{
    getEndpoint: ({ resource }) => resource,

    buildQueryParams: async ({ resource, pagination, filters }) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;

      const params: Record<string, string|number> = { page, limit: pageSize };

      filters?.forEach((filter) => {
        const field = 'field' in filter ? filter.field : '';

        const value = String(filter.value);

        if ( resource === 'subjects') {
          if (field === 'department') params.department = value;
          if (field === 'code' || field === 'name') params.search = value;
        }
      })

      return params;
    },
    mapResponse: async (response) => {
      const payload : ListResponse = await response.clone().json();

      return payload.data || [];
    },

    getTotalCount: async (response) => {
      const payload : ListResponse = await response.clone().json();

      return payload.pagination?.total ?? payload.data?.length ?? 0;
    }
  },
  create: {
    mapResponse: async (response) => {
      const payload = await response.clone().json();
      return payload.data ?? payload;
    },
  },
};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider }