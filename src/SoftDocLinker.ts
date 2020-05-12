import CacheDataStorageFactory from "@/cache/CacheDataStorageFactory";
import CacheManagementFactory from "@/cache/CacheManagementFactory";
import ConfigDataProviderFactory from "@/dataprovider/config/ConfigDataProviderFactory";
import DocCollectionDataProviderFactory from "@/dataprovider/doc/DocCollectionDataProviderFactory";
import ConfigDataInterface from "@/model/config/ConfigDataInterface";
import ConfigDataRepository from "@/model/config/ConfigDataRepository";
import ConfigDataRepositoryFactory from "@/model/config/ConfigDataRepositoryFactory";
import DataRepositoryInterface from "@/model/DataRepositoryInterface";
import DocCollectionDataRepositoryFactory from "@/model/doc/DocCollectionDataRepositoryFactory";
import DocCollectionInterface from "@/model/doc/DocCollectionInterface";
import StateManagementFactory from "@/model/StateManagementFactory";
import StateManagementInterface from "@/model/StateManagementInterface";
import SoftDocLinkerInterface from "@/SoftDocLinkerInterface";

/**
 * Is responsible to compose the data management together and
 * make it available to the components.
 *
 * @since 2.0.0
 */
export class SoftDocLinker implements SoftDocLinkerInterface {
    /**
     * The CacheManagementFactory used to create
     * CacheManagementInterface instances.
     */
    protected _cacheManagementFactory: CacheManagementFactory;

    /**
     * The CacheDataStorageFactory used to create
     * CacheDataStorage instances.
     */
    protected _cacheDataStorageFactory: CacheDataStorageFactory;

    /**
     * The ConfigDataProviderFactory used to create
     * DataProviderInterface<ConfigDataInterface> instances.
     */
    protected _configDataProviderFactory: ConfigDataProviderFactory;

    /**
     * The config data repository that manages the config data
     */
    protected _configDataRepository?: DataRepositoryInterface<
        ConfigDataInterface
    >;

    /**
     * The factory used to create ConfigDataRepository instances
     */
    protected _configDataRepositoryFactory: ConfigDataRepositoryFactory;

    /**
     * The DocDataProviderFactory used to create new DocDataProviders
     */
    protected _docCollectionDataProviderFactory: DocCollectionDataProviderFactory;

    /**
     * The factory used to create DocCollectionRepository instances
     */
    protected _docCollectionDataRepositoryFactory: DocCollectionDataRepositoryFactory;

    /**
     * The data repository that manages the available documentations
     */
    protected _docCollectionDataRepository?: DataRepositoryInterface<
        DocCollectionInterface
    >;

    /**
     * The factory used to create StateManagement instances
     */
    protected _stateManagementFactory: StateManagementFactory;

    /**
     * State management that handles data fetching and sharing of the current state.
     */
    protected _stateManagement?: StateManagementInterface;

    /**
     * Constructor
     *
     * @param configDataProviderFactory
     * @param cacheDataStorageFactory
     * @param cacheManagementFactory
     * @param docCollectionDataProviderFactory
     */
    /* istanbul ignore next */
    constructor(
        configDataProviderFactory: ConfigDataProviderFactory = new ConfigDataProviderFactory(),
        cacheDataStorageFactory: CacheDataStorageFactory = new CacheDataStorageFactory(),
        configDataRepositoryFactory: ConfigDataRepositoryFactory = new ConfigDataRepositoryFactory(),
        cacheManagementFactory: CacheManagementFactory = new CacheManagementFactory(),
        docCollectionDataProviderFactory: DocCollectionDataProviderFactory = new DocCollectionDataProviderFactory(),
        docCollectionDataRepositoryFactory: DocCollectionDataRepositoryFactory = new DocCollectionDataRepositoryFactory(),
        stateManagementFactory: StateManagementFactory = new StateManagementFactory()
    ) {
        this._configDataProviderFactory = configDataProviderFactory;
        this._configDataRepositoryFactory = configDataRepositoryFactory;
        this._cacheDataStorageFactory = cacheDataStorageFactory;
        this._cacheManagementFactory = cacheManagementFactory;
        this._docCollectionDataProviderFactory = docCollectionDataProviderFactory;
        this._docCollectionDataRepositoryFactory = docCollectionDataRepositoryFactory;
        this._stateManagementFactory = stateManagementFactory;
    }

    /**
     * @inheritdoc
     */
    public async getConfigDataRepository(): Promise<
        DataRepositoryInterface<ConfigDataInterface>
    > {
        if (this._configDataRepository !== undefined) {
            return this._configDataRepository;
        }

        this._configDataRepository = this._configDataRepositoryFactory.create(
            this._configDataProviderFactory.create("ajax"),
            this._cacheManagementFactory.create("indexedDB"),
            this._cacheDataStorageFactory
        );

        return this._configDataRepository;
    }

    /**
     * @inheritdoc
     */
    public async getDocCollectionDataRepository(): Promise<
        DataRepositoryInterface<DocCollectionInterface>
    > {
        if (this._docCollectionDataRepository !== undefined) {
            return this._docCollectionDataRepository;
        }

        const configDataRepository: DataRepositoryInterface<ConfigDataInterface> = await this.getConfigDataRepository();
        const configDataInterface: ConfigDataInterface = await configDataRepository.load(
            ConfigDataRepository.CONFIG_KEY,
            false
        );

        this._docCollectionDataRepository = this._docCollectionDataRepositoryFactory.create(
            this._docCollectionDataProviderFactory.create(
                configDataInterface.backend
            ),
            this._cacheManagementFactory.create(configDataInterface.cache),
            this._cacheDataStorageFactory
        );

        return this._docCollectionDataRepository;
    }

    /**
     * @inheritdoc
     */
    public async getStateManagement(): Promise<StateManagementInterface> {
        if (this._stateManagement !== undefined) {
            return this._stateManagement;
        }

        this._stateManagement = this._stateManagementFactory.create(
            await this.getConfigDataRepository(),
            await this.getDocCollectionDataRepository()
        );

        return this._stateManagement;
    }
}

// Export single instance of SoftDocLinker
const SOFT_DOC_LINKER: SoftDocLinkerInterface = new SoftDocLinker();
export default SOFT_DOC_LINKER;