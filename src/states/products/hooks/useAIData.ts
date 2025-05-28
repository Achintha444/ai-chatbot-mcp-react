import { useContext } from "react";
import AIDataContext, { type AIDataContextProps } from "../contexts/aIDataContext";

/**
 * Interface for the return type of the `useAIData` hook.
 */
export type UseAIDataInterface = AIDataContextProps;

/**
 * Hook that provides access to the information about the AI data context.
 * @returns An object containing the AI data context properties.
 */
const useAIData = (): UseAIDataInterface => {
    const context: AIDataContextProps | null = useContext(AIDataContext);

    if (!context) {
        throw new Error("useAIData must be used within a AIDataProvider");
    }

    return context;
};

export default useAIData;
