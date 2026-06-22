import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";
import { BACKEND_BASE_URL } from "@/constants";
import { ListResponse } from "@/types";
import { HttpError } from "@refinedev/core";

if (!BACKEND_BASE_URL) {
  throw new Error('BACKEND_BASE_URL is not set in the environment variables');
}

const buildHttpError = async (response: Response): Promise<HttpError> => {
  let message = 'An unknown error occurred';
  let statusCode = 500;

  try {
    const payload = (await response.json()) as { message: string };
    if (payload?.message) message = payload.message;
  } catch (error) {
    console.error('Error building HTTP error', error);
  }
  return { message, statusCode };
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
      if(!response.ok) throw await buildHttpError(response);
      const payload : ListResponse = await response.clone().json();

      return payload.data || [];
    },

    getTotalCount: async (response) => {
      if(!response.ok) throw await buildHttpError(response);
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